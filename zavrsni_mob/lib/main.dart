import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  _MainScreenState createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  final _formKey = GlobalKey<FormState>();
  final _ipController = TextEditingController();
  BluetoothDevice? _leftSkiDevice;
  BluetoothDevice? _rightSkiDevice;
  List<BluetoothService> _leftSkiServices = [];
  List<BluetoothService> _rightSkiServices = [];
  final List<double> _leftSkiData = [];
  final List<double> _rightSkiData = [];
  BluetoothCharacteristic? _leftSkiCharacteristic;
  BluetoothCharacteristic? _rightSkiCharacteristic;

  String? hostIpAddress;
  bool isLoading = false;
  bool _leftSkiReady = false;
  bool _rightSkiReady = false;
  String leftSkiLastValue = 'N/A';
  String rightSkiLastValue = 'N/A';

  double? _leftSkiTempValue;
  double? _rightSkiTempValue;

  @override
  void dispose() {
    _ipController.dispose();
    super.dispose();
  }

  void _showErrorSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(message),
      backgroundColor: Colors.red,
    ));
  }

  double _convertToDegrees(List<int> value) {
    int sign = value[0] == 1 ? -1 : 1;
    int hexValue = value[1];
    double degrees = sign * (hexValue * 90 / 0x64);
    return degrees;
  }

  void _sendData() async {
    if (hostIpAddress != null &&
        _leftSkiData.length >= 25 &&
        _rightSkiData.length >= 25) {
      final String timestamp = DateTime.now().toIso8601String();
      final Map<String, dynamic> data = {
        "timestamp": timestamp,
        "measurements": {
          "left_ski": List<double>.from(_leftSkiData),
          "right_ski": List<double>.from(_rightSkiData),
        },
        "measurement_delay": 500
      };

      try {
        final response = await http.post(
          Uri.parse('http://$hostIpAddress:8080/publish'),
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsonEncode(data),
        );

        if (response.statusCode == 200) {
          print('Data sent successfully');
        } else {
          _showErrorSnackbar('Failed to send data: ${response.statusCode}');
        }
      } catch (e) {
        _showErrorSnackbar('Failed to send data: $e');
      }

      // Clear the accumulated data after sending
      _leftSkiData.clear();
      _rightSkiData.clear();
    }
  }

  void _accumulateData(BluetoothDevice device, List<int> value) {
    double degrees = _convertToDegrees(value);
    if (device == _leftSkiDevice) {
      _leftSkiTempValue = degrees;
      _leftSkiReady = true;
      setState(() {
        leftSkiLastValue = 'x: ${value[0]}, y: ${value[1]} ($degrees°)';
      });
    } else if (device == _rightSkiDevice) {
      _rightSkiTempValue = degrees;
      _rightSkiReady = true;
      setState(() {
        rightSkiLastValue = 'x: ${value[0]}, y: ${value[1]} ($degrees°)';
      });
    }

    if (_leftSkiReady && _rightSkiReady) {
      if (_leftSkiTempValue != null && _rightSkiTempValue != null) {
        _leftSkiData.add(_leftSkiTempValue!);
        _rightSkiData.add(_rightSkiTempValue!);
      }
      _leftSkiReady = false;
      _rightSkiReady = false;
      _leftSkiTempValue = null;
      _rightSkiTempValue = null;

      if (_leftSkiData.length >= 25 && _rightSkiData.length >= 25) {
        _sendData();
      }
    }
  }

  Future<void> connectToDevice(String deviceName) async {
    try {
      await FlutterBluePlus.startScan(
        timeout: const Duration(seconds: 10),
        withServices: [Guid('00FF')],
        withNames: [deviceName],
      );

      FlutterBluePlus.scanResults.listen((results) async {
        for (ScanResult r in results) {
          if (r.device.name == deviceName) {
            try {
              await FlutterBluePlus.stopScan();
              await r.device.connect();
              if (deviceName == 'ESP_GATTS_SKI1') {
                setState(() {
                  _leftSkiDevice = r.device;
                });
                _leftSkiServices = await _leftSkiDevice!.discoverServices();
                for (BluetoothService service in _leftSkiServices) {
                  for (BluetoothCharacteristic characteristic
                      in service.characteristics) {
                    setState(() {
                      _leftSkiCharacteristic = characteristic;
                    });
                    await _leftSkiCharacteristic!.setNotifyValue(true);
                    _leftSkiCharacteristic!.value.listen((value) {
                      if (value.isEmpty) return;
                      _accumulateData(_leftSkiDevice!, value);
                    });
                  }
                }
              } else if (deviceName == 'ESP_GATTS_SKI2') {
                setState(() {
                  _rightSkiDevice = r.device;
                });
                _rightSkiServices = await _rightSkiDevice!.discoverServices();
                for (BluetoothService service in _rightSkiServices) {
                  for (BluetoothCharacteristic characteristic
                      in service.characteristics) {
                    setState(() {
                      _rightSkiCharacteristic = characteristic;
                    });
                    await _rightSkiCharacteristic!.setNotifyValue(true);
                    _rightSkiCharacteristic!.value.listen((value) {
                      if (value.isEmpty) return;
                      _accumulateData(_rightSkiDevice!, value);
                    });
                  }
                }
              }
            } catch (e) {
              _showErrorSnackbar(
                  'Error connecting to device $deviceName: ${e.toString()}');
            }
          }
        }
      });
    } catch (e) {
      _showErrorSnackbar(
          'Error starting scan for $deviceName: ${e.toString()}');
    }
  }

  void _printIPAddress() {
    if (_formKey.currentState!.validate()) {
      print('IP Address: ${_ipController.text}');
      hostIpAddress = _ipController.text;
      connectToDevice('ESP_GATTS_SKI1');
      connectToDevice('ESP_GATTS_SKI2');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Main Screen'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : hostIpAddress == null
                ? Form(
                    key: _formKey,
                    child: Column(
                      children: <Widget>[
                        TextFormField(
                          controller: _ipController,
                          decoration: const InputDecoration(
                            labelText: 'Enter IP Address',
                          ),
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Please enter an IP address';
                            }
                            // Simple IP address validation
                            RegExp ipExp =
                                RegExp(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$');
                            if (!ipExp.hasMatch(value)) {
                              return 'Please enter a valid IP address';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: _printIPAddress,
                          child: const Text('Submit'),
                        ),
                      ],
                    ),
                  )
                : Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Left Ski Last Value: $leftSkiLastValue'),
                      Text('Right Ski Last Value: $rightSkiLastValue'),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () {
                          connectToDevice('ESP_GATTS_SKI1');
                          connectToDevice('ESP_GATTS_SKI2');
                        },
                        child: const Text('Reconnect'),
                      ),
                    ],
                  ),
      ),
    );
  }
}
