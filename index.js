var Service, Characteristic
const packageJson = require('./package.json')
const request = require('request')
const jp = require('jsonpath')

module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-door-lock-shelly1', 'ShellyDoorLockOpener', DoorLockOpener)
}

function DoorLockOpener(log, config) {
  this.log = log
  this.config = config

  this.name = config.name

  this.unlockURL = config.unlockURL
  this.lockURL = config.lockURL

  this.manufacturer = config.manufacturer || packageJson.author.name
  this.serial = config.serial || packageJson.version
  this.model = config.model || packageJson.name
  this.firmware = config.firmware || packageJson.version

  this.username = config.username || null
  this.password = config.password || null
  this.timeout = config.timeout || 3000

  this.http_method = config.http_method || 'GET'

  this.polling = config.polling || false
  this.pollInterval = config.pollInterval || 120

  this.statusURL = config.statusURL
  this.statusKey = config.statusKey || '$.inputs[0].input'

  this.statusValueUnlocked = config.statusValueUnlocked || '0'
  this.statusValueLocked = config.statusValueLocked || '1'

  if (this.username != null && this.password != null) {
    this.auth = {
      user: this.username,
      pass: this.password,
    }
  }

  this.service = new Service.LockMechanism(this.name)
}

DoorLockOpener.prototype = {
  identify: function (callback) {
    this.log('Identify requested!')
    callback()
  },

  _httpRequest: function (url, body, method, callback) {
    request(
      {
        url: url,
        body: body,
        method: this.http_method,
        timeout: this.timeout,
        rejectUnauthorized: false,
        auth: this.auth,
      },
      function (error, response, body) {
        callback(error, response, body)
      },
    )
  },

  _getStatus: function (callback) {
    var url = this.statusURL

    if (this.config.debug) {
      this.log.debug('Getting status: %s', url)
    }

    this._httpRequest(
      url,
      '',
      'GET',
      function (error, response, responseBody) {
        if (error) {
          this.log.error('Error getting status: %s', error.message)
          this.service.getCharacteristic(Characteristic.LockCurrentState).updateValue(3) //  unknown
          callback(error)
        } else {
          let statusValue = 0

          if (this.statusKey) {
            var originalStatusValue = jp
              .query(typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody, this.statusKey, 1)
              .pop()

            if (new RegExp(this.statusValueUnlocked).test(originalStatusValue)) {
              statusValue = 0
            } else if (new RegExp(this.statusValueLocked).test(originalStatusValue)) {
              statusValue = 1
            }

            if (this.config.debug) {
              this.log.debug(
                'Transformed status value from %s to %s (%s)',
                originalStatusValue,
                statusValue,
                this.statusKey,
              )
            }
          } else {
            statusValue = responseBody
          }
          this.service.getCharacteristic(Characteristic.LockCurrentState).updateValue(statusValue)
          this.service.getCharacteristic(Characteristic.LockTargetState).updateValue(statusValue)

          if (this.config.debug) {
            this.log.debug('Updated lock state to: %s', statusValue)
          }

          callback()
        }
      }.bind(this),
    )
  },

  setLockTargetState: function (value, callback) {
    var url

    this.log.debug('Setting LockTargetState to %s', value)

    if (value === 1) {
      url = this.lockURL
    } else {
      url = this.unlockURL
    }

    this._httpRequest(
      url,
      '',
      this.http_method,
      function (error, response, responseBody) {
        if (error) {
          this.log.warn('Error setting LockTargetState: %s', error.message)
          callback(error)
        } else {
          if (value === 1) {
            this.log('Locking')
            this.lock()
          } else {
            this.log('Unlocking')
            this.unlock()
          }
          callback()
        }
      }.bind(this),
    )
  },

  unlock: function () {
    this.service.getCharacteristic(Characteristic.LockTargetState).updateValue(0)
  },

  lock: function () {
    this.service.getCharacteristic(Characteristic.LockTargetState).updateValue(1)
  },

  getServices: function () {
    this.informationService = new Service.AccessoryInformation()

    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
      .setCharacteristic(Characteristic.Model, this.model)
      .setCharacteristic(Characteristic.SerialNumber, this.serial)
      .setCharacteristic(Characteristic.FirmwareRevision, this.firmware)

    this.service.getCharacteristic(Characteristic.LockTargetState).on('set', this.setLockTargetState.bind(this))

    if (this.polling) {
      this._getStatus(function () {})

      setInterval(
        function () {
          this._getStatus(function () {})
        }.bind(this),
        this.pollInterval * 1000,
      )
    } else {
      this.service.getCharacteristic(Characteristic.LockCurrentState).updateValue(1)

      this.service.getCharacteristic(Characteristic.LockTargetState).updateValue(1)
    }

    return [this.informationService, this.service]
  },
}
