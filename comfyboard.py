from machine import Pin, SoftI2C
import dht
import kidbright as kb
import network
from lcd_api import LcdApi
from i2c_lcd import I2cLcd
from time import sleep
from umqtt.robust import MQTTClient
from machine import Pin, ADC, I2C
import json
import time
import network
import uasyncio as asyncio
from config import WIFI_SSID, WIFI_PASS, MQTT_BROKER, MQTT_USER, MQTT_PASS
from math import log10

I2C_ADDR = 0x27
totalRows = 2
totalColumns = 16
i2c = SoftI2C(scl=Pin(22), sda=Pin(21), freq=10000)
lcd = I2cLcd(i2c, I2C_ADDR, totalRows, totalColumns)

lamp = Pin(25, Pin.OUT)
lamp.value(1)
led_wifi = Pin(2, Pin.OUT)
led_wifi.value(1)

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
print("*** Connecting to WiFi...")
wlan.connect(WIFI_SSID, WIFI_PASS)
while not wlan.isconnected():
    time.sleep(0.5)
print("*** Wifi connected")

led_iot = Pin(12, Pin.OUT)
led_iot.value(1)

mqtt = MQTTClient(client_id="",
                  server=MQTT_BROKER,
                  user=MQTT_USER,
                  password=MQTT_PASS)

print("*** Connecting to MQTT broker...")
mqtt.connect()
print("*** MQTT broker connected")
mqtt.set_callback(sub_callback)
mqtt.subscribe("b6510545381/trigger_sensor")

# Declare global variables for temperature and humidity
global temp
global hum

def sub_callback(topic, payload):
    if topic.decode() == "b6510545381/trigger_sensor":
        try:
            print(payload)
            asyncio.create_task(send_sensor_data(payload))
        except ValueError:
            pass

async def sub_scribe():
    while True:
        mqtt.check_msg()
        await asyncio.sleep_ms(0)

async def sensor():
    global temp
    global hum
    while True:
        lcd.clear()
        try:
            dht11 = dht.DHT11(Pin(32))
            dht11.measure()
            temp = dht11.temperature()
            hum = dht11.humidity()
            lcd.putstr("Temp: " + str(temp))
            lcd.move_to(0, 1)
            lcd.putstr("Humid: " + str(hum))
        except OSError as e:
            print("Failed to read sensor.")
        sleep(5)

async def send_sensor_data(uuid):
    temperature = temp
    humidity = hum
    data = {
        'secret': uuid,
        'temp': temperature,
        'humid': humidity
    }
    mqtt.publish('b6510545381/callback_front', json.dumps(data))
    print(data)
    await asyncio.sleep(10)

asyncio.create_task(sensor())
asyncio.create_task(sub_scribe())
asyncio.run_until_complete()