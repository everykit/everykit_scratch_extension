    /*This program is free software: you can redistribute it and/or modify
    *it under the terms of the GNU General Public License as published by
    *the Free Software Foundation, either version 3 of the License, or
    *(at your option) any later version.
    *
    *This program is distributed in the hope that it will be useful,
    *but WITHOUT ANY WARRANTY; without even the implied warranty of
    *MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    *GNU General Public License for more details.
    *
    *You should have received a copy of the GNU General Public License
    *along with this program.  If not, see <http://www.gnu.org/licenses/>.
    */
    
    (function(ext) {
    
    
    
    var USB_PORT = [1, 2, 3, 4, 5];
    var connected = false;
    var bluetoothRevEventFlag = new Array();
    var EveryKitData = new Array();
    var deviceList = new Array();
    var driverSocket = io.connect("http://192.168.137.2:3001",{'forceNew': true});
    console.log("loading Extension");   
    driverSocket.on('connect', function() {
        connected = true;
        driverSocket.emit("refresh");
    });
    driverSocket.on('disconnect', function() {
        connected = false;
    });
    driverSocket.on('reconnect', function() {
    
    });
    
    driverSocket.on("newDevice", function(data) {
        deviceList.push(data);
        switch(data.deviceType)
        {
            case 65025:
            {
                //temp module
                EveryKitData[data.portID[1]] = new Array();

                break;
            }
            case 65026:
            {
                //RGB module
                break;
            }
            case 65027:
            {
                //bluetooth module
                EveryKitData[data.portID[1]] = new Array();

                break;
            }
            case 65028:
            {
                //smartplug module
                break;
            }
        }
        
    });
    driverSocket.on('error',function(msg){
    })
    
    driverSocket.on("removeDevice", function(data) { 
    });
    
    driverSocket.on("receiveData", function(data) {
        for(i = 0 ; i < deviceList.length ; i++)
        {
            if(deviceList[i].deviceID == data.DeviceID)
            {
                var portID = deviceList[i].portID[1];
                var deviceType = deviceList[i].deviceType;
                EveryKitData[portID][deviceType] = data.Data;
                
                if(deviceType == 65027)
                    bluetoothRevEventFlag[portID] = true;
                break;
            }
        }
    });
    var LOW = 0,
    HIGH = 1;
    
    var INPUT = 0,
    OUTPUT = 1;
    
    
    ext.tempModule = function(port){
        if(EveryKitData[port][65025] != null)
            return EveryKitData[port][65025]
        else
            return 0;
    }
    ext.ledModule = function(port,color){
        var deviceID = null ;
        for(i = 0 ; i < deviceList.length ; i++)
        {
            if(deviceList[i].portID[1] == port && deviceList[i].deviceType == 65026)
            {
                deviceID = deviceList[i].deviceID;
                break;
            }
        }
        if(deviceID == null)
        {
            return;
        }
           /*
        빨간색-RED
초록색-GREEN
파란색-BLUE
노란색-YELLOW
자홍색-MAGENTA
청록색-CYAN
흰색-WHITE
        */
        switch(color)
        {
            case "빨간색":
            case "Red":
            {
                data = {"deviceID":deviceID,"data":[0,0,1]};
                driverSocket.emit('sendData',data);
                break;
            }
            case "파란색":
            case "Blue":
            {
                data = {"deviceID":deviceID,"data":[0,1,0]};
                driverSocket.emit('sendData',data);
                break;
            }
            case "초록색":
            case "Green":
            {
                data = {"deviceID":deviceID,"data":[1,0,0]};
                driverSocket.emit('sendData',data);
                break;
            }
            case "노란색":
            case "Yellow":
            {
                data = {"deviceID":deviceID,"data":[1,0,1]};
                driverSocket.emit('sendData',data);
                break;
            }
            case "자홍색":
            case "Magenta":
            {
                data = {"deviceID":deviceID,"data":[0,1,1]};
                driverSocket.emit('sendData',data);
                break;
            }
            case "청록색":
            case "Cyan":
            {
                data = {"deviceID":deviceID,"data":[1,1,0]};
                driverSocket.emit('sendData',data);
                break;
            }
            case "흰색":
            case "White":
            {
                data = {"deviceID":deviceID,"data":[1,1,1]};
                driverSocket.emit('sendData',data);
                break;
            }
            case "끄기":
            case "Off":
            {
                data = {"deviceID":deviceID,"data":[0,0,0]};
                driverSocket.emit('sendData',data);
                break;
            }
        }
        return 0;
    }
    ext.smartplug = function(port,set){
        var deviceID = null ;
        for(i = 0 ; i < deviceList.length ; i++)
        {
            if(deviceList[i].portID[1] == port && deviceList[i].deviceType == 65028)
            {
                deviceID = deviceList[i].deviceID;
                break;
            }
        }
        if(deviceID == null)
        {
            return;
        }
        
        if(set == "on")
        {
            data = {"deviceID":deviceID,"data":[1]};
            driverSocket.emit('sendData',data);
        }
        else
        {
            data = {"deviceID":deviceID,"data":[0]};
            driverSocket.emit('sendData',data);
        }
    }
    
    ext.bluetoothReceiveEvent = function(port){
        if(bluetoothRevEventFlag[port] != null && bluetoothRevEventFlag[port] == true)
        {
            bluetoothRevEventFlag[port] = false;
            return true;
        }
            
        return false;
    }
    
    ext.bluetoothReceive = function(port)
    {
        if(EveryKitData[port][65027] != null)
        {
            return EveryKitData[port][65027].trim();
        }
        
        return;
    }
    
    ext.bluetoothSend = function(port,msg)
    {
        var deviceID = null ;
        for(i = 0 ; i < deviceList.length ; i++)
        {
            if(deviceList[i].portID[1] == port && deviceList[i].deviceType == 65027)
            {
                deviceID = deviceList[i].deviceID;
                break;
            }
        }
        if(deviceID == null)
        {
            return;
        }
        
        data = {"deviceID":deviceID,"data":msg};
        driverSocket.emit('sendData',data);
        return true;
    }
    
    ext._getStatus = function() {
    if (connected) return {status: 2, msg: 'Arduino connected'};
    else return {status: 1, msg: 'Arduino disconnected'};
    };
    
    ext._deviceConnected = function(dev) {
        driverSocket = io.connect("http://192.168.137.2:3001",{'forceNew': true});
    };
    
    ext._deviceRemoved = function(dev) {
        driverSocket.disconnect();
    };
    ext._shutdown = function () {
        driverSocket.disconnect();
    };
    
    // Check for GET param 'lang'
    var paramString = window.location.search.replace(/^\?|\/$/g, '');
    var vars = paramString.split("&");
    var lang = 'en';
    for (var i=0; i<vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair.length > 1 && pair[0]=='lang')
      lang = pair[1];
    }
    
    var blocks = {
    ko: [
    ['r', '온도 모듈 포트 < %d.usb_port >', 'tempModule', 5],
    [' ', 'LED 모듈 포트 < %d.usb_port > %m.led', 'ledModule', 5],
    ['r', '블루투수 모듈-수신 포트 < %d.usb_port >', 'bluetoothReceive', 5],
    ['h', '블루투수 모듈-송신 이벤트 포트 < %d.usb_port >', 'bluetoothReceiveEvent', 5],
    [' ', '블루투수 모듈-송신 포트 < %d.usb_port > %s', 'bluetoothSend', 5],
    [' ', '스마트플러그 모듈 포트 < %d.usb_port > %m.control', 'smartplug', 5],
    ],
    en: [
    ['r', 'Temp Module port < %d.usb_port >', 'tempModule', 5],
    [' ', 'LED Module port < %d.usb_port > %m.led', 'ledModule', 5],
    ['r', 'Bluetooth-send port < %d.usb_port >', 'bluetoothReceive', 5],
    ['h', 'Bluetooth-receive Event port < %d.usb_port >', 'bluetoothReceiveEvent', 5],
    [' ', 'Bluetooth-receive port < %d.usb_port > %s', 'bluetoothSend', 5],
    [' ', 'Smart Plug Module port < %d.usb_port > %m.control', 'smartplug', 5],
    ]
    };
    
 
    var menus = {
    en: {
    usb_port: USB_PORT,
    control: ['on', 'off'],
    ops: ['>', '=', '<'],
    led: ['Red','Blue','Green','Yellow','Magenta','Cyan','White',"Off"],
    tiltDir: ['up', 'down', 'left', 'right']
    },
    ko: {
    usb_port: USB_PORT,
    control: ['on', 'off'],
    ops: ['>', '=', '<'],
    led: ["빨간색","파란색","초록색","노란색","자홍색","청록색","흰색","끄기"],
    tiltDir: ['up', 'down', 'left', 'right']    
    }
    };
    
    var descriptor = {
    blocks: blocks[lang],
    menus: menus[lang],
    url: 'http://khanning.github.io/scratch-arduino-extension'
    };
    
    ScratchExtensions.register('EveryKit Extension', descriptor, ext);
    })({});
