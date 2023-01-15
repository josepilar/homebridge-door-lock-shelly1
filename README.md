<p align="center">
  <a href="https://github.com/homebridge/homebridge"><img src="https://raw.githubusercontent.com/homebridge/branding/master/logos/homebridge-color-round-stylized.png" height="140"></a>
</p>

# homebridge-door-lock-shelly1

[![npm](https://img.shields.io/npm/v/homebridge-door-lock-shelly1.svg)](https://www.npmjs.com/package/homebridge-door-lock-shelly1) [![npm](https://img.shields.io/npm/dt/homebridge-door-lock-shelly1.svg)](https://www.npmjs.com/package/homebridge-door-lock-shelly1)

This work is forked from https://github.com/jmaferreira/homebridge-garage-door-shelly1.git. Kudos to Miguel & Andreas.

## Description

This [homebridge](https://github.com/nfarina/homebridge) plugin exposes a web-based garage opener to Apple's [HomeKit](http://www.apple.com/ios/home/). Using simple HTTP requests, the plugin allows you to open/close the garage. It works as a general purpose HTTP client for any relay, but it works particularly well with a Shelly 1 relay.

## Installation

1. Install [Homebridge](https://github.com/homebridge/homebridge).
2. Install the plugin by running `npm install -g homebridge-door-lock-shelly1` or by searching for `homebridge-door-lock-shelly1` on the [plugins tab](https://github.com/homebridge/homebridge#installing-plugins) if you are using [Homebridge UI](https://www.npmjs.com/package/homebridge-config-ui-x) or [Hoobs](https://hoobs.org/).
3. Update your Homebridge `config.json` accordingly.

## Configuration

NOTE: Don't forget to update `shelly_ip` to the IP address of your Shelly relay.

```json
"accessories": [
     {
        "accessory": "ShellyDoorLockOpener",
        "name": "Back door",
        "http_method": "GET",
        "unlockURL": "http://shelly_ip/relay/0?turn=on",
        "lockURL": "http://shelly_ip/relay/0?turn=on",
        "polling": true,
        "pollInterval": 60,
        "username": "lock",
        "password": "Mh4hc7EDJF8mMkzv",
        "manufacturer": "BFT",
        "model": "SCE-MA (Board)",
        "statusURL": "http://shelly_ip/status",
        "statusKey": "$.inputs[0].input",
        "statusValueUnlocked": "0",
        "statusValueLocked`": "1",
        "debug": "false"
    }
]
```

## Options

### Core

| Key         | Description                             | Default |
| ----------- | --------------------------------------- | ------- |
| `accessory` | Must be `GarageDoorOpener`              | N/A     |
| `name`      | Name to appear in the Home app          | N/A     |
| `unlockURL` | URL to trigger the opening of your lock | N/A     |
| `lockURL`   | URL to trigger the closing of your lock | N/A     |

### Optional fields

| Key                   | Description                                                                                                                                                                 | Default             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `polling`             | Whether the state should be polled at intervals                                                                                                                             | `false`             |
| `pollInterval`        | Time (in seconds) between device polls (if `polling` is enabled)                                                                                                            | `120`               |
| `statusURL`           | URL to retrieve state on poll (if `statusField*` options are not set, expects HTTP response body to be `0` or `1`)                                                          | N/A                 |
| `statusKey`           | [JSONPath](https://www.npmjs.com/package/jsonpath) that identifies the property that contains the status of the door (e.g. `$.inputs[0].input` is the default for Shelly 1) | `$.inputs[0].input` |
| `statusValueUnlocked` | Regex that will match the `open` state of the relay status (e.g. `open`)                                                                                                    | `0`                 |
| `statusValueLocked`   | Regex that will match the `closed` state of the relay status (e.g. `closed`)                                                                                                | `1`                 |

### Additional options

| Key            | Description                                                                                        | Default |
| -------------- | -------------------------------------------------------------------------------------------------- | ------- |
| `timeout`      | Time (in milliseconds) until the accessory will be marked as _Not Responding_ if it is unreachable | `3000`  |
| `http_method`  | HTTP method used to communicate with the device                                                    | `GET`   |
| `username`     | Username if HTTP authentication is enabled                                                         | N/A     |
| `password`     | Password if HTTP authentication is enabled                                                         | N/A     |
| `model`        | Appears under the _Model_ field for the accessory                                                  | plugin  |
| `serial`       | Appears under the _Serial_ field for the accessory                                                 | version |
| `manufacturer` | Appears under the _Manufacturer_ field for the accessory                                           | author  |
| `firmware`     | Appears under the _Firmware_ field for the accessory                                               | version |
| `debug`        | Display debug messages on Homebridge log                                                           | false   |

### State key

| State | Description |
| ----- | ----------- |
| `0`   | Unlocked    |
| `1`   | Locked      |

## Wiring

![Shelly 1 wiring](https://savjee.be/uploads/2020-06-smart-garage-door-shelly-home-assistant/shelly-schematic-dc.png)

More information at https://savjee.be/2020/06/make-garage-door-opener-smart-shelly-esphome-home-assistant/

## Door open/closed sensor

In order to know for sure if your gate is open or closed you need to install a Reed Switch sensor connected between `L` and `SW` (order is irrelevant). These cost between €2 and €5.

![Reed Switch](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlGm8m0RQnE2NE15JjLc4KEOUdR0QghniwDQkSQjto3mPq9qPUVGmlrB5vBVWsL1sJlLU9sWAOs4Y&usqp=CAc)

For Shelly 1 and a normally open reed switch (NO) the following options need to be set:

```json
"accessories": [
     {
       ...
		 "statusKey": "$.inputs[0].input",
		 "statusValueUnlocked": "0",
		 "statusValueLocked": "1"
		 ...
	  }
	]
```

For a normally closed switch (NC), use:

```json
"accessories": [
     {
       ...
		 "statusKey": "$.inputs[0].input",
		 "statusValueUnlocked": "1",
		 "statusValueLocked": "0"
		 ...
	  }
	]
```
