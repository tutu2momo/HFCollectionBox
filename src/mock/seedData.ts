/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MedicalDevice, DeviceModelRule, DiagnosticRecord, AcquisitionBox, BatchInspectionHistoryRecord } from '../types';

// 设备型号规则知识库
export const MOCK_MODEL_RULES: DeviceModelRule[] = [
  {
    id: 'RULE_MINDRAY_N_SERIES',
    model: 'BeneVision N17 / N15 / N12',
    manufacturer: '迈瑞医疗 (Mindray)',
    category: '病人监护仪',
    expectedLineCount: 2,
    hasRecvWithoutPatient: true,
    allowNoDataStorage: false,
    idlePacketDescription: '监护仪开机后，即使未连接患者导联，也会周期性通过串口/网口向采集盒发送导联脱落(Lead-Off)与仪器自检心跳数据包(recv > 0)。但网关端规则过滤无效导联包，因此无患者时数据库不增加生命体征点数。',
    typicalProtocol: 'Mindray BeneView / eGateway HL7 (9600-115200bps 或 TCP 5000)'
  },
  {
    id: 'RULE_PHILIPS_INTELLIVUE',
    model: 'IntelliVue MX800 / MX700 / MP50',
    manufacturer: '飞利浦医疗 (Philips)',
    category: '麻醉监护系统',
    expectedLineCount: 2,
    hasRecvWithoutPatient: true,
    allowNoDataStorage: false,
    idlePacketDescription: '通过 MIB/RS232 或 LAN 发送 Association Request 及 Keep-Alive，脱机时产生少量心跳帧(recv > 0)。若无患者波形则不入核心体征库。',
    typicalProtocol: 'Philips Data Export Interface (Port 24105 / RS232 115200)'
  },
  {
    id: 'RULE_DRAGER_PRIMUS',
    model: 'Primus / Perseus A500',
    manufacturer: '德尔格 (Dräger)',
    category: '麻醉机',
    expectedLineCount: 1,
    hasRecvWithoutPatient: false,
    allowNoDataStorage: false,
    idlePacketDescription: '德尔格麻醉机在待机模式(Standby)下，通气气道压力与气体浓度为零，串口静默无主动下发报文(recv = 0)。只有启动机械通气或自检后才持续输出 Medibus 协议帧。',
    typicalProtocol: 'Dräger Medibus II / MedibusX (RS232 19200bps 8E1)'
  },
  {
    id: 'RULE_MAQUET_SERVO_I',
    model: 'Servo-i / Servo-u',
    manufacturer: '迈柯唯 (Maquet / Getinge)',
    category: '呼吸机',
    expectedLineCount: 1,
    hasRecvWithoutPatient: false,
    allowNoDataStorage: false,
    idlePacketDescription: '待机状态无呼气流速波形，下行口无有效参数(recv = 0)。进入通气后由下行口上报实时流量、潮气量与峰压。',
    typicalProtocol: 'Servo Computer Interface (SCI Protocol, 9600bps 8N1)'
  },
  {
    id: 'RULE_HAMILTON_G5',
    model: 'Hamilton-G5 / C6',
    manufacturer: '哈密顿 (Hamilton Medical)',
    category: '智能呼吸机',
    expectedLineCount: 1,
    hasRecvWithoutPatient: true,
    allowNoDataStorage: true,
    idlePacketDescription: '开机即通过 Block Data 格式输出设备状态字与传感器环境压，即使未连接呼吸回路也存在周期性握手帧(recv > 0)。',
    typicalProtocol: 'Hamilton Data Communication Interface (DCI)'
  },
  {
    id: 'RULE_DATEYS_OHMEDA',
    model: 'Aespire 7900 / Avance CS2',
    manufacturer: 'GE医疗 (GE Healthcare)',
    category: '麻醉工作站',
    expectedLineCount: 2,
    hasRecvWithoutPatient: true,
    allowNoDataStorage: false,
    idlePacketDescription: '主控单元开机即响应 Poll 请求，空载状态下仅回应 ACK 与设备型号状态字。',
    typicalProtocol: 'GE Datex-Ohmeda AS/3 Record Format (RS232 19200 8O1)'
  }
];

// 预设初始设备列表 (15台典型设备，涵盖各种单线、双线、各科室及故障状态)
export const INITIAL_DEVICES: MedicalDevice[] = [
  {
    id: 'DEV-01',
    code: 'DEV-2024-OR01-01',
    name: '多参数监护仪 BeneVision N17',
    category: 'MONITOR',
    model: 'BeneVision N17',
    manufacturer: '迈瑞医疗 (Mindray)',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 01 (心胸数字化)',
    boxIp: '192.168.10.101',
    boxMac: '00:1A:C2:7B:82:11',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'NORMAL',
    lines: [
      {
        lineId: 'L01',
        lineName: 'ECG/IBP/SpO2生命体征主通道',
        boxIp: '192.168.10.101',
        port: 8001,
        status: 'NORMAL',
        dataCount5Min: 1480,
        lastDataTime: '2026-10-20 20:10:45',
        lastDiagnosisTime: '2026-10-20 18:30:00',
        lastDiagnosisResult: '采集链路通畅，体征入库正常',
        protocol: 'Mindray-eGateway'
      },
      {
        lineId: 'L02',
        lineName: '呼末CO2与麻醉气体模块',
        boxIp: '192.168.10.101',
        port: 8002,
        status: 'NORMAL',
        dataCount5Min: 1475,
        lastDataTime: '2026-10-20 20:10:42',
        lastDiagnosisTime: '2026-10-20 18:30:00',
        lastDiagnosisResult: '采集链路通畅，气体参数入库正常',
        protocol: 'Mindray-Gas'
      }
    ]
  },
  {
    id: 'DEV-02',
    code: 'DEV-2024-OR02-01',
    name: '双通道监护仪 BeneVision N15',
    category: 'MONITOR',
    model: 'BeneVision N15',
    manufacturer: '迈瑞医疗 (Mindray)',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 02 (神经外科)',
    boxIp: '192.168.10.102',
    boxMac: '00:1A:C2:7B:82:12',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'PARTIAL_NO_DATA',
    notes: '同一盒子两条线：L01正常入库，L02近5分钟无数据；诊断L02时应自动跳过Ping！',
    lines: [
      {
        lineId: 'L01',
        lineName: 'ECG/SpO2/NIBP生命体征',
        boxIp: '192.168.10.102',
        port: 8001,
        status: 'NORMAL',
        dataCount5Min: 1390,
        lastDataTime: '2026-10-20 20:09:55',
        protocol: 'Mindray-eGateway'
      },
      {
        lineId: 'L02',
        lineName: 'BIS脑电麻醉深度模块',
        boxIp: '192.168.10.102',
        port: 8002,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 17:15:20',
        protocol: 'Serial-BIS'
      }
    ]
  },
  {
    id: 'DEV-03',
    code: 'DEV-2024-OR03-01',
    name: '麻醉工作站 Primus',
    category: 'ANESTHESIA',
    model: 'Primus',
    manufacturer: '德尔格 (Dräger)',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 03 (骨科手术室)',
    boxIp: '192.168.10.103',
    boxMac: '00:1A:C2:7B:82:13',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'ALL_NO_DATA',
    notes: '所有线无数据且采集盒断电/网线拔脱，Ping失败',
    lines: [
      {
        lineId: 'L01',
        lineName: 'Medibus通气参数与环路监测',
        boxIp: '192.168.10.103',
        port: 8001,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 16:20:00',
        protocol: 'Dräger Medibus II'
      }
    ]
  },
  {
    id: 'DEV-04',
    code: 'DEV-2024-OR04-01',
    name: '监护仪 IntelliVue MX800',
    category: 'MONITOR',
    model: 'IntelliVue MX800',
    manufacturer: '飞利浦医疗 (Philips)',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 04 (普外腔镜)',
    boxIp: '192.168.10.104',
    boxMac: '00:1A:C2:7B:82:14',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'ALL_NO_DATA',
    notes: 'Ping通但读不到预期线号L01，提示现场线缆可能脱落',
    lines: [
      {
        lineId: 'L01',
        lineName: 'MX800高速波形与趋势数据',
        boxIp: '192.168.10.104',
        port: 8001,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 15:40:12',
        protocol: 'Philips Data Export'
      }
    ]
  },
  {
    id: 'DEV-05',
    code: 'DEV-2024-OR05-01',
    name: '重症呼吸机 Servo-i',
    category: 'VENTILATOR',
    model: 'Servo-i',
    manufacturer: '迈柯唯 (Maquet)',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 05 (心血管外科)',
    boxIp: '192.168.10.105',
    boxMac: '00:1A:C2:7B:82:15',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'ALL_NO_DATA',
    notes: 'fopen打开L01.json失败，网关配置缺失',
    lines: [
      {
        lineId: 'L01',
        lineName: 'SCI呼吸力学与通气参数',
        boxIp: '192.168.10.105',
        port: 8001,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 14:10:00',
        protocol: 'Maquet-SCI'
      }
    ]
  },
  {
    id: 'DEV-06',
    code: 'DEV-2024-OR06-01',
    name: '麻醉工作站 Avance CS2',
    category: 'ANESTHESIA',
    model: 'Avance CS2',
    manufacturer: 'GE医疗 (GE Healthcare)',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 06 (妇产科手术间)',
    boxIp: '192.168.10.106',
    boxMac: '00:1A:C2:7B:82:16',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'ALL_NO_DATA',
    notes: '下发配置超时，网关到采集盒管道阻塞',
    lines: [
      {
        lineId: 'L01',
        lineName: 'GE麻醉机通气参数',
        boxIp: '192.168.10.106',
        port: 8001,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 13:50:00',
        protocol: 'GE Datex Record'
      }
    ]
  },
  {
    id: 'DEV-07',
    code: 'DEV-2024-OR07-01',
    name: '监护仪 BeneVision N12',
    category: 'MONITOR',
    model: 'BeneVision N12',
    manufacturer: '迈瑞医疗 (Mindray)',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 07 (泌尿外科)',
    boxIp: '192.168.10.107',
    boxMac: '00:1A:C2:7B:82:17',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'ALL_NO_DATA',
    notes: 'fclose保存失败（存储空间满或只读保护）',
    lines: [
      {
        lineId: 'L01',
        lineName: '生命体征主线',
        boxIp: '192.168.10.107',
        port: 8001,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 12:30:00',
        protocol: 'Mindray-eGateway'
      }
    ]
  },
  {
    id: 'DEV-08',
    code: 'DEV-2024-OR08-01',
    name: '智能呼吸机 Hamilton-G5',
    category: 'VENTILATOR',
    model: 'Hamilton-G5',
    manufacturer: '哈密顿 (Hamilton Medical)',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 08 (日间手术室)',
    boxIp: '192.168.10.108',
    boxMac: '00:1A:C2:7B:82:18',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'ALL_NO_DATA',
    notes: 'attach下行串口应用失败（波特率冲突）',
    lines: [
      {
        lineId: 'L01',
        lineName: 'Hamilton-DCI波形通道',
        boxIp: '192.168.10.108',
        port: 8001,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 11:20:00',
        protocol: 'Hamilton DCI'
      }
    ]
  },
  {
    id: 'DEV-09',
    code: 'DEV-2024-OR09-01',
    name: '麻醉机 Primus',
    category: 'ANESTHESIA',
    model: 'Primus',
    manufacturer: '德尔格 (Dräger)',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 09 (五官头颈外科)',
    boxIp: '192.168.10.109',
    boxMac: '00:1A:C2:7B:82:19',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'ALL_NO_DATA',
    notes: 'attach OK 但 recv = 0（设备未开机/处于Standby/线缆断开）',
    lines: [
      {
        lineId: 'L01',
        lineName: 'Medibus通气通道',
        boxIp: '192.168.10.109',
        port: 8001,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 10:15:00',
        protocol: 'Dräger Medibus II'
      }
    ]
  },
  {
    id: 'DEV-10',
    code: 'DEV-2024-OR10-01',
    name: '监护仪 BeneVision N17',
    category: 'MONITOR',
    model: 'BeneVision N17',
    manufacturer: '迈瑞医疗 (Mindray)',
    campus: '总院区',
    department: '第二手术部',
    room: '手术间 10 (数字化复合杂交)',
    boxIp: '192.168.10.110',
    boxMac: '00:1A:C2:7B:82:20',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'ALL_NO_DATA',
    notes: 'attach OK, recv > 0, 需弹窗核实患者使用状态（有患者 -> 网关解析入库阻塞）',
    lines: [
      {
        lineId: 'L01',
        lineName: 'N17主通道体征采集',
        boxIp: '192.168.10.110',
        port: 8001,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 09:40:00',
        protocol: 'Mindray-eGateway'
      }
    ]
  },
  {
    id: 'DEV-11',
    code: 'DEV-2024-OR11-01',
    name: '多参数监护仪 IntelliVue MX700',
    category: 'MONITOR',
    model: 'IntelliVue MX700',
    manufacturer: '飞利浦医疗 (Philips)',
    campus: '总院区',
    department: '第二手术部',
    room: '手术间 11 (急诊抢救手术间)',
    boxIp: '192.168.10.111',
    boxMac: '00:1A:C2:7B:82:21',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'ALL_NO_DATA',
    notes: 'attach OK, recv > 0, 需弹窗核实患者使用状态（无患者 -> 闲置符合预期）',
    lines: [
      {
        lineId: 'L01',
        lineName: 'MX700主监护通道',
        boxIp: '192.168.10.111',
        port: 8001,
        status: 'NO_DATA_PENDING',
        dataCount5Min: 0,
        lastDataTime: '2026-10-20 08:30:00',
        protocol: 'Philips Data Export'
      }
    ]
  },
  {
    id: 'DEV-12',
    code: 'DEV-2024-OR12-01',
    name: '麻醉工作站 Perseus A500',
    category: 'ANESTHESIA',
    model: 'Perseus A500',
    manufacturer: '德尔格 (Dräger)',
    campus: '总院区',
    department: '第二手术部',
    room: '手术间 12 (儿科手术室)',
    boxIp: '192.168.10.112',
    boxMac: '00:1A:C2:7B:82:22',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'QUERY_ERROR',
    notes: '数据库近5分钟查询超时报错，明确标注为查询失败而非设备无数据',
    lines: [
      {
        lineId: 'L01',
        lineName: 'MedibusX 通气数据',
        boxIp: '192.168.10.112',
        port: 8001,
        status: 'QUERY_FAILED',
        dataCount5Min: -1,
        lastDataTime: null,
        protocol: 'Dräger MedibusX'
      }
    ]
  },
  {
    id: 'DEV-13',
    code: 'DEV-2024-PACU-01',
    name: '麻醉苏醒监护仪 BeneVision N12',
    category: 'MONITOR',
    model: 'BeneVision N12',
    manufacturer: '迈瑞医疗 (Mindray)',
    campus: '总院区',
    department: '麻醉复苏部PACU',
    room: 'PACU 床位 01',
    boxIp: '', // 绑定不完整
    aggregateStatus: 'BINDING_INCOMPLETE',
    notes: '未配置采集盒IP与下行线号端口，不可发起诊断，需先完善台账绑定',
    lines: [
      {
        lineId: 'L-UNBOUND',
        lineName: '待配置线号',
        boxIp: '',
        port: 0,
        status: 'CONFIG_INCOMPLETE',
        dataCount5Min: 0,
        lastDataTime: null,
        protocol: '未指定'
      }
    ]
  },
  {
    id: 'DEV-14',
    code: 'DEV-2024-PACU-02',
    name: '麻醉苏醒监护仪 BeneVision N12',
    category: 'MONITOR',
    model: 'BeneVision N12',
    manufacturer: '迈瑞医疗 (Mindray)',
    campus: '总院区',
    department: '麻醉复苏部PACU',
    room: 'PACU 床位 02',
    boxIp: '192.168.10.114',
    boxMac: '00:1A:C2:7B:82:24',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'NORMAL',
    lines: [
      {
        lineId: 'L01',
        lineName: '基础心电血氧监测通道',
        boxIp: '192.168.10.114',
        port: 8001,
        status: 'NORMAL',
        dataCount5Min: 1240,
        lastDataTime: '2026-10-20 20:11:10',
        protocol: 'Mindray-eGateway'
      }
    ]
  },
  {
    id: 'DEV-15',
    code: 'DEV-2024-ICU-01',
    name: '重症呼吸机 Hamilton-C6',
    category: 'VENTILATOR',
    model: 'Hamilton-C6',
    manufacturer: '哈密顿 (Hamilton Medical)',
    campus: '东院区',
    department: '重症医学科ICU',
    room: 'ICU 负压隔离间 01',
    boxIp: '192.168.20.101',
    boxMac: '00:1A:C2:7B:83:01',
    boxFirmware: 'V2.4.12-build2025',
    aggregateStatus: 'NORMAL',
    lines: [
      {
        lineId: 'L01',
        lineName: '呼吸力学闭环控制通道',
        boxIp: '192.168.20.101',
        port: 8001,
        status: 'NORMAL',
        dataCount5Min: 1520,
        lastDataTime: '2026-10-20 20:11:32',
        protocol: 'Hamilton DCI'
      }
    ]
  }
];

// 预设既往诊断与处理记录 (包含人工闭环记录)
export const INITIAL_DIAGNOSTIC_RECORDS: DiagnosticRecord[] = [
  {
    id: 'REC-20261020-001',
    recordTime: '2026-10-20 18:30:14',
    boxId: 'B01',
    boxModel: 'MedGate-Pro 400',
    campus: '总院区',
    department: '第一手术部',
    deviceId: 'DEV-01',
    deviceName: '多参数监护仪 BeneVision N17',
    deviceModel: 'BeneVision N17',
    room: '手术间 01 (心胸数字化)',
    boxIp: '192.168.10.101',
    targetLineId: 'L01',
    coBoxLinesSummary: '同盒L02正常接收 (1475点/5min)',
    conclusionTitle: '全链路状态完好，采集与入库正常',
    conclusionType: 'NORMAL',
    severity: 'SUCCESS',
    responsibleRole: 'FIELD_ENGINEER',
    actionAdvice: ['链路各节点工作正常，无需人工干预', '持续进行周期性健康巡检'],
    handlingStatus: 'VERIFIED',
    resolvedBy: '现场工程师-张峰',
    resolvedAt: '2026-10-20 18:35:00',
    resolvedNote: '常规例行复核，数据流平稳。',
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: '同盒共存与网络连通性检查',
        description: '检查同盒其他线号或执行 Ping 测试',
        status: 'SKIPPED',
        skipReason: '同盒其他线号 L02 近5分钟有正常数据(1475点)，已具备在线证据，按规则跳过 Ping。',
        durationMs: 5
      },
      {
        id: 's2',
        stepNumber: 2,
        title: '读取预期线号配置',
        description: '连接采集盒RPC服务，读取线号 L01 的映射注册表',
        status: 'SUCCESS',
        durationMs: 38,
        evidenceSummary: '成功读取预期线号 L01 配置项，硬件绑定对应下行串口 COM1 (8001)'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'fopen 打开配置描述文件',
        description: '尝试打开 L01.json 配置文件',
        status: 'SUCCESS',
        durationMs: 42,
        evidenceSummary: 'fopen("L01.json", "r") 返回句柄 fd=14，配置校验MD5正确'
      },
      {
        id: 's4',
        stepNumber: 4,
        title: '平台配置下发与校验',
        description: '网关向采集盒下发协议解析参数表',
        status: 'SUCCESS',
        durationMs: 65,
        evidenceSummary: '配置下发 ACK 正常，波特率 115200bps，校验位 None'
      },
      {
        id: 's5',
        stepNumber: 5,
        title: 'fclose 保存并关闭配置文件',
        description: '落盘保存配置并释放句柄',
        status: 'SUCCESS',
        durationMs: 22,
        evidenceSummary: 'fclose 成功返回 0，系统缓存已同步'
      },
      {
        id: 's6',
        stepNumber: 6,
        title: 'attach 应用下行端口',
        description: '应用下行串口或网口通信驱动与缓冲队列',
        status: 'SUCCESS',
        durationMs: 54,
        evidenceSummary: 'attach OK, 物理通道打开，RX FIFO 分配完成 (16KB Buffer)'
      },
      {
        id: 's7',
        stepNumber: 7,
        title: 'recv 报文接收检查',
        description: '监听采集盒下行口是否收到有效数据帧',
        status: 'SUCCESS',
        durationMs: 120,
        evidenceSummary: 'recv 探测成功：累计收到 32 帧有效 HL7 数据包 (recv = 32 > 0)'
      },
      {
        id: 's8',
        stepNumber: 8,
        title: '数据库近5分钟入库量核验',
        description: '查询时序体征库是否有最近数据写入',
        status: 'SUCCESS',
        durationMs: 35,
        evidenceSummary: '近5分钟写入 1480 点，最后入库时间为 2026-10-20 20:10:45'
      }
    ],
    logs: [
      { id: 'l1', timestamp: '18:30:14.102', level: 'INFO', source: 'DIAG_ORCHESTRATOR', message: '启动单项诊断: 设备 DEV-01, 目标线号 L01' },
      { id: 'l2', timestamp: '18:30:14.108', level: 'INFO', source: 'RULE_ENGINE', message: '检测到同盒线号 L02 状态为 NORMAL (5min数据量 1475 > 0)，执行跳过 Ping 逻辑' },
      { id: 'l3', timestamp: '18:30:14.146', level: 'INFO', source: 'BOX_CLIENT', message: 'RPC Connect: 192.168.10.101:9999 [TLSv1.3 ESTABLISHED]' },
      { id: 'l4', timestamp: '18:30:14.188', level: 'INFO', source: 'BOX_CLIENT', message: 'fopen("L01.json") -> FD:14, checksum: a9f83c1b OK' },
      { id: 'l5', timestamp: '18:30:14.253', level: 'INFO', source: 'GATEWAY_SERVICE', message: 'Config Push payload size 412 bytes, ACK received' },
      { id: 'l6', timestamp: '18:30:14.275', level: 'INFO', source: 'BOX_CLIENT', message: 'fclose(FD:14) -> 0 (Flush to disk complete)' },
      { id: 'l7', timestamp: '18:30:14.329', level: 'INFO', source: 'BOX_CLIENT', message: 'attach(/dev/ttyS1, 115200, 8N1) -> STATUS_OK' },
      { id: 'l8', timestamp: '18:30:14.449', level: 'INFO', source: 'BOX_CLIENT', message: 'recv stream capture: 32 packets, avg size 128 bytes' },
      { id: 'l9', timestamp: '18:30:14.484', level: 'INFO', source: 'DB_CONNECTOR', message: 'Query DB metrics: 1480 rows inserted in past 5m' }
    ]
  },
  {
    id: 'REC-20261020-002',
    recordTime: '2026-10-20 16:22:30',
    boxId: 'B03',
    boxModel: 'MedGate-Pro 400',
    campus: '总院区',
    department: '第一手术部',
    deviceId: 'DEV-03',
    deviceName: '麻醉工作站 Primus',
    deviceModel: 'Primus',
    room: '手术间 03 (骨科手术室)',
    boxIp: '192.168.10.103',
    targetLineId: 'L01',
    coBoxLinesSummary: '单线设备，无同盒其他线',
    conclusionTitle: '采集盒网络不可达 / 硬件掉电',
    conclusionType: 'BOX_OFFLINE',
    severity: 'CRITICAL',
    responsibleRole: 'FIELD_ENGINEER',
    actionAdvice: [
      '现场排查采集盒电源适配器是否插紧、指示灯是否亮起',
      '检查手术床/吊塔到墙壁交换机的网线水晶头是否脱落',
      '确认对应交换机端口 VLAN 配置未被误修改'
    ],
    handlingStatus: 'TRANSFERRED',
    transferredTo: '现场实施组-李工 (工单#20261020-F03)',
    transferNote: '该手术间目前空档，已派现场运维前往3号手术室吊塔检查采集盒电源与网线插口。',
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: '同盒共存与网络连通性检查',
        description: '检查同盒其他线号或执行 Ping 测试',
        status: 'FAILED',
        durationMs: 3012,
        evidenceSummary: 'Ping 192.168.10.103 超时 (4 packets transmitted, 0 received, 100% packet loss)'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: '读取预期线号配置',
        description: '连接采集盒RPC服务，读取线号 L01 的映射注册表',
        status: 'PENDING',
        evidenceSummary: '前置步骤失败，未执行'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'fopen 打开配置描述文件',
        description: '尝试打开 L01.json 配置文件',
        status: 'PENDING'
      },
      {
        id: 's4',
        stepNumber: 4,
        title: '平台配置下发与校验',
        description: '网关向采集盒下发协议解析参数表',
        status: 'PENDING'
      },
      {
        id: 's5',
        stepNumber: 5,
        title: 'fclose 保存并关闭配置文件',
        description: '落盘保存配置并释放句柄',
        status: 'PENDING'
      },
      {
        id: 's6',
        stepNumber: 6,
        title: 'attach 应用下行端口',
        description: '应用下行串口或网口通信驱动与缓冲队列',
        status: 'PENDING'
      },
      {
        id: 's7',
        stepNumber: 7,
        title: 'recv 报文接收检查',
        description: '监听采集盒下行口是否收到有效数据帧',
        status: 'PENDING'
      },
      {
        id: 's8',
        stepNumber: 8,
        title: '数据库近5分钟入库量核验',
        description: '查询时序体征库是否有最近数据写入',
        status: 'PENDING'
      }
    ],
    logs: [
      { id: 'l1', timestamp: '16:22:30.010', level: 'INFO', source: 'DIAG_ORCHESTRATOR', message: '开始对 DEV-03 / L01 进行链路诊断' },
      { id: 'l2', timestamp: '16:22:30.015', level: 'INFO', source: 'RULE_ENGINE', message: '同盒无在线数据线号，进入网关侧物理 Ping 诊断' },
      { id: 'l3', timestamp: '16:22:31.020', level: 'WARN', source: 'GATEWAY_SERVICE', message: 'PING 192.168.10.103: Request timeout for seq 0' },
      { id: 'l4', timestamp: '16:22:32.022', level: 'WARN', source: 'GATEWAY_SERVICE', message: 'PING 192.168.10.103: Request timeout for seq 1' },
      { id: 'l5', timestamp: '16:22:33.025', level: 'ERROR', source: 'GATEWAY_SERVICE', message: 'PING 192.168.10.103: 100% loss, Host Unreachable' },
      { id: 'l6', timestamp: '16:22:33.028', level: 'ERROR', source: 'DIAG_ORCHESTRATOR', message: '步骤1失败，根据业务规则阻断后续配置与收包步骤' }
    ]
  },
  {
    id: 'REC-20261020-003',
    recordTime: '2026-10-20 14:15:22',
    boxId: 'B02',
    boxModel: 'MedGate-Pro 400',
    campus: '总院区',
    department: '第一手术部',
    deviceId: 'DEV-02',
    deviceName: '双通道监护仪 BeneVision N15',
    deviceModel: 'BeneVision N15',
    room: '手术间 02 (神经外科)',
    boxIp: '192.168.10.102',
    targetLineId: 'L02',
    coBoxLinesSummary: '同盒L01正常入库 (1390点/5m)',
    conclusionTitle: '同盒具备在线证据，BIS模块物理线缆脱开',
    conclusionType: 'LINE_DISCONNECTED',
    severity: 'WARNING',
    responsibleRole: 'FIELD_ENGINEER',
    actionAdvice: [
      '【规则豁免】同盒L01已具备在线证据，已跳过Ping',
      '现场检查2号手术室麻醉深度BIS模块专用串口转接线是否松脱'
    ],
    handlingStatus: 'RESOLVED',
    resolvedBy: '现场工程师-赵工',
    resolvedAt: '2026-10-20 14:30:00',
    resolvedNote: '重新插牢BIS模块串口卡扣，数据恢复入库。',
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: '同盒共存与网络连通性检查',
        description: '检查同盒其他线号或执行 Ping 测试',
        status: 'SKIPPED',
        skipReason: '同盒其他线号 L01 近 5 分钟有数据 (1390点)，已具备在线证据，豁免 Ping。',
        durationMs: 8
      },
      {
        id: 's2',
        stepNumber: 2,
        title: '读取预期线号配置',
        description: '建立采集盒会话，校验预期线号注册信息',
        status: 'SUCCESS',
        durationMs: 40,
        evidenceSummary: '读取到预期线号 L02 注册映射 COM2 (8002)'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'fopen 打开配置描述文件',
        description: '打开采集盒内置 L02.json 配置文件',
        status: 'SUCCESS',
        durationMs: 36
      },
      {
        id: 's4',
        stepNumber: 4,
        title: '平台配置下发与校验',
        description: '网关向采集盒下发协议解析参数表',
        status: 'SUCCESS',
        durationMs: 70
      },
      {
        id: 's5',
        stepNumber: 5,
        title: 'fclose 保存并关闭配置文件',
        description: '落盘保存配置并释放文件锁',
        status: 'SUCCESS',
        durationMs: 25
      },
      {
        id: 's6',
        stepNumber: 6,
        title: 'attach 应用下行端口',
        description: '绑定下行串口，激活驱动',
        status: 'SUCCESS',
        durationMs: 48,
        evidenceSummary: 'attach OK，下行串口监听就绪'
      },
      {
        id: 's7',
        stepNumber: 7,
        title: 'recv 报文接收检查',
        description: '检测采集盒下行口实际收到的物理报文',
        status: 'FAILED',
        durationMs: 1500,
        evidenceSummary: '下行口在1500ms内完全静默 (recv = 0)'
      },
      {
        id: 's8',
        stepNumber: 8,
        title: '平台数据库入库核验',
        description: '核实网关解析入库管道',
        status: 'PENDING'
      }
    ],
    logs: [
      { id: 'l1', timestamp: '14:15:22.012', level: 'INFO', source: 'DIAG_ORCHESTRATOR', message: '启动单项诊断: 设备 DEV-02 / 异常线号 L02' },
      { id: 'l2', timestamp: '14:15:22.018', level: 'INFO', source: 'RULE_ENGINE', message: '【核心规则】同盒L01正常入库(1390点)，判定盒子在线，跳过Ping' },
      { id: 'l3', timestamp: '14:15:22.250', level: 'WARN', source: 'BOX_CLIENT', message: 'recv ioctl timeout: 0 bytes arrived on COM2' }
    ]
  },
  {
    id: 'REC-20261020-004',
    recordTime: '2026-10-20 11:20:18',
    boxId: 'B04',
    boxModel: 'MedGate-Standard 300',
    campus: '总院区',
    department: '第一手术部',
    deviceId: 'DEV-04',
    deviceName: '病人监护仪 IntelliVue MX800',
    deviceModel: 'IntelliVue MX800',
    room: '手术间 04 (普外腔镜)',
    boxIp: '192.168.10.104',
    targetLineId: 'L01',
    coBoxLinesSummary: '单线设备',
    conclusionTitle: 'Ping通但读不到预期线号，需现场拍摄接口线缆',
    conclusionType: 'LINE_DISCONNECTED',
    severity: 'WARNING',
    responsibleRole: 'FIELD_ENGINEER',
    actionAdvice: [
      '现场排查：拍摄采集盒 RJ45 下行网口指示灯与线缆连接',
      '检查监护仪背面 LAN/MIB 转接头是否卡扣松落',
      '若现场连接正常仍读不到，再转交网关工程师定位'
    ],
    handlingStatus: 'UNHANDLED',
    steps: [
      { id: 's1', stepNumber: 1, title: '同盒共存与网络连通性检查', description: 'Ping 采集盒 IP', status: 'SUCCESS', durationMs: 12, evidenceSummary: 'PING 192.168.10.104 连通正常 (RTT=2.1ms)' },
      { id: 's2', stepNumber: 2, title: '读取预期线号配置', description: '校验预期线号注册信息', status: 'FAILED', durationMs: 45, evidenceSummary: '未读取到线号 L01 的注册应答，设备下行通信物理断开' },
      { id: 's3', stepNumber: 3, title: 'fopen 打开配置描述文件', description: '打开 L01.json', status: 'PENDING' },
      { id: 's4', stepNumber: 4, title: '平台配置下发与校验', description: '协议解析参数表', status: 'PENDING' },
      { id: 's5', stepNumber: 5, title: 'fclose 保存并关闭配置文件', description: '保存配置释放文件锁', status: 'PENDING' },
      { id: 's6', stepNumber: 6, title: 'attach 应用下行端口', description: '绑定下行通信端口', status: 'PENDING' },
      { id: 's7', stepNumber: 7, title: 'recv 报文接收检查', description: '下行口收包检测', status: 'PENDING' },
      { id: 's8', stepNumber: 8, title: '平台数据库入库核验', description: '时序库写入核验', status: 'PENDING' }
    ],
    logs: [
      { id: 'l1', timestamp: '11:20:18.010', level: 'INFO', source: 'DIAG_ORCHESTRATOR', message: '启动单项诊断: B04 / DEV-04 / L01' },
      { id: 'l2', timestamp: '11:20:18.025', level: 'INFO', source: 'GATEWAY_SERVICE', message: 'PING 192.168.10.104: 0% loss, RTT avg=2.1ms' },
      { id: 'l3', timestamp: '11:20:18.070', level: 'ERROR', source: 'BOX_CLIENT', message: 'RPC ReadLineConfig: Line L01 not registered in hardware table' }
    ]
  },
  {
    id: 'REC-20261020-005',
    recordTime: '2026-10-20 09:45:00',
    boxId: 'B05',
    boxModel: 'MedGate-Pro 400',
    campus: '总院区',
    department: '第一手术部',
    deviceId: 'DEV-05',
    deviceName: '重症呼吸机 Servo-i',
    deviceModel: 'Servo-i',
    room: '手术间 05 (心血管外科)',
    boxIp: '192.168.10.105',
    targetLineId: 'L01',
    coBoxLinesSummary: '单线设备',
    conclusionTitle: 'fopen 打开配置描述文件失败',
    conclusionType: 'CONFIG_ERROR',
    severity: 'CRITICAL',
    responsibleRole: 'GATEWAY_ENGINEER',
    actionAdvice: [
      '采集盒内置存储文件系统异常或 L01.json 损坏',
      '已转交网关工程师排查采集盒 Flash 存储介质或远程推送修复配置'
    ],
    handlingStatus: 'TRANSFERRED',
    transferredTo: '网关值班工程师 (加急)',
    transferNote: '采集盒 L01.json 文件系统校验损坏，需下发完整包重写。',
    steps: [
      { id: 's1', stepNumber: 1, title: '同盒共存与网络连通性检查', description: 'Ping 采集盒 IP', status: 'SUCCESS', durationMs: 10, evidenceSummary: 'Ping 通，网络延迟 1.8ms' },
      { id: 's2', stepNumber: 2, title: '读取预期线号配置', description: '校验预期线号注册信息', status: 'SUCCESS', durationMs: 35, evidenceSummary: '读取预期线号 L01 正常' },
      { id: 's3', stepNumber: 3, title: 'fopen 打开配置描述文件', description: '打开 L01.json', status: 'FAILED', durationMs: 50, evidenceSummary: 'fopen("L01.json", "r") 返回 ENOENT/EIO 句柄打开失败' },
      { id: 's4', stepNumber: 4, title: '平台配置下发与校验', description: '协议参数表', status: 'PENDING' },
      { id: 's5', stepNumber: 5, title: 'fclose 保存并关闭配置文件', description: '保存配置文件', status: 'PENDING' },
      { id: 's6', stepNumber: 6, title: 'attach 应用下行端口', description: '绑定下行端口', status: 'PENDING' },
      { id: 's7', stepNumber: 7, title: 'recv 报文接收检查', description: '下行口收包检测', status: 'PENDING' },
      { id: 's8', stepNumber: 8, title: '平台数据库入库核验', description: '时序库写入核验', status: 'PENDING' }
    ],
    logs: [
      { id: 'l1', timestamp: '09:45:00.010', level: 'INFO', source: 'DIAG_ORCHESTRATOR', message: '启动单项诊断: B05 / DEV-05 / L01' },
      { id: 'l2', timestamp: '09:45:00.095', level: 'ERROR', source: 'BOX_CLIENT', message: 'fopen("L01.json"): File Descriptor null, errno=2 (No such file)' }
    ]
  },
  {
    id: 'REC-20261020-006',
    recordTime: '2026-10-20 08:50:33',
    boxId: 'B10',
    boxModel: 'MedGate-Pro 400',
    campus: '总院区',
    department: '第二手术部',
    deviceId: 'DEV-10',
    deviceName: '多参数监护仪 BeneVision N17',
    deviceModel: 'BeneVision N17',
    room: '手术间 10 (数字化复合杂交)',
    boxIp: '192.168.10.110',
    targetLineId: 'L01',
    coBoxLinesSummary: '单线设备',
    conclusionTitle: '收到报文但未入库（网关解析/写库阻塞）',
    conclusionType: 'DB_INGESTION_BLOCKED',
    severity: 'CRITICAL',
    responsibleRole: 'GATEWAY_ENGINEER',
    patientInUseStatus: 'YES',
    actionAdvice: [
      '【关键证据】现场已确认患者在使用，且采集盒下行口已持续收到报文 (recv > 0)',
      '立即转交网关工程师排查：① 上行网关是否收到报文；② 解析模块是否崩溃；③ 消息中间件或数据库写入事务是否死锁'
    ],
    handlingStatus: 'TRANSFERRED',
    transferredTo: '物联网网关组-陈工',
    transferNote: '现场复合手术室手术中，患者导联已连接，recv持续增长，但数据库5分钟0点，请检查中间件队列。',
    steps: [
      { id: 's1', stepNumber: 1, title: '同盒共存与网络连通性检查', description: 'Ping 采集盒 IP', status: 'SUCCESS', durationMs: 8, evidenceSummary: 'Ping 192.168.10.110 通畅' },
      { id: 's2', stepNumber: 2, title: '读取预期线号配置', description: '校验预期线号注册信息', status: 'SUCCESS', durationMs: 30, evidenceSummary: '读取预期线号 L01 映射成功' },
      { id: 's3', stepNumber: 3, title: 'fopen 打开配置描述文件', description: '打开 L01.json', status: 'SUCCESS', durationMs: 35, evidenceSummary: 'fopen 句柄打开成功 fd=18' },
      { id: 's4', stepNumber: 4, title: '平台配置下发与校验', description: '协议解析参数表', status: 'SUCCESS', durationMs: 60, evidenceSummary: '配置下发 ACK 正常' },
      { id: 's5', stepNumber: 5, title: 'fclose 保存并关闭配置文件', description: '保存配置文件', status: 'SUCCESS', durationMs: 20, evidenceSummary: 'fclose 成功' },
      { id: 's6', stepNumber: 6, title: 'attach 应用下行端口', description: '绑定下行端口', status: 'SUCCESS', durationMs: 45, evidenceSummary: 'attach OK，驱动就绪' },
      { id: 's7', stepNumber: 7, title: 'recv 报文接收检查', description: '下行口收包检测', status: 'SUCCESS', durationMs: 350, evidenceSummary: '下行口收到有效报文 1,280 字节 (recv > 0)' },
      { id: 's8', stepNumber: 8, title: '平台数据库入库核验', description: '时序库写入核验', status: 'FAILED', durationMs: 120, evidenceSummary: '时序数据库近 5 分钟体征入库点为 0' }
    ],
    logs: [
      { id: 'l1', timestamp: '08:50:33.010', level: 'INFO', source: 'DIAG_ORCHESTRATOR', message: '启动单项诊断: B10 / DEV-10 / L01' },
      { id: 'l2', timestamp: '08:50:33.550', level: 'INFO', source: 'BOX_CLIENT', message: 'recv 1280 bytes Mindray HL7 packet on COM1' },
      { id: 'l3', timestamp: '08:50:33.670', level: 'ERROR', source: 'GATEWAY_SERVICE', message: 'DB Ingestion count = 0 in last 5 minutes while recv > 0' }
    ]
  },
  {
    id: 'REC-20261019-001',
    recordTime: '2026-10-19 16:30:00',
    boxId: 'B02',
    boxModel: 'MedGate-Pro 400',
    campus: '总院区',
    department: '第一手术部',
    deviceId: 'DEV-02',
    deviceName: '双通道监护仪 BeneVision N15',
    deviceModel: 'BeneVision N15',
    room: '手术间 02 (神经外科)',
    boxIp: '192.168.10.102',
    targetLineId: 'L01',
    coBoxLinesSummary: '同盒L02正常接收',
    conclusionTitle: '全链路状态完好，采集与入库正常',
    conclusionType: 'NORMAL',
    severity: 'SUCCESS',
    responsibleRole: 'FIELD_ENGINEER',
    actionAdvice: ['链路测试通过，指标采集平稳'],
    handlingStatus: 'VERIFIED',
    resolvedBy: '现场工程师-赵工',
    resolvedAt: '2026-10-19 16:35:00',
    resolvedNote: '前日例行巡检复核，通道入库正常。',
    steps: [
      { id: 's1', stepNumber: 1, title: '同盒共存与网络连通性检查', description: '同盒其他线号检查', status: 'SKIPPED', durationMs: 6, skipReason: '同盒L02具备在线证据，跳过Ping' },
      { id: 's2', stepNumber: 2, title: '读取预期线号配置', description: '读取线号注册信息', status: 'SUCCESS', durationMs: 30 },
      { id: 's3', stepNumber: 3, title: 'fopen 打开配置描述文件', description: '打开 L01.json', status: 'SUCCESS', durationMs: 28 },
      { id: 's4', stepNumber: 4, title: '平台配置下发与校验', description: '配置下发校验', status: 'SUCCESS', durationMs: 50 },
      { id: 's5', stepNumber: 5, title: 'fclose 保存并关闭配置文件', description: '落盘保存', status: 'SUCCESS', durationMs: 18 },
      { id: 's6', stepNumber: 6, title: 'attach 应用下行端口', description: '绑定下行端口', status: 'SUCCESS', durationMs: 40 },
      { id: 's7', stepNumber: 7, title: 'recv 报文接收检查', description: '下行口收包', status: 'SUCCESS', durationMs: 110 },
      { id: 's8', stepNumber: 8, title: '平台数据库入库核验', description: '时序库写入', status: 'SUCCESS', durationMs: 35, evidenceSummary: '近5分钟入库 1,410 点' }
    ],
    logs: [
      { id: 'l1', timestamp: '16:30:00.010', level: 'INFO', source: 'DIAG_ORCHESTRATOR', message: '例行复核: B02 / DEV-02 / L01' }
    ]
  }
];

// 采集设备盒子主台账数据 (以采集盒为主实体，缩短编号为 B01 ~ B15)
export const MOCK_BOXES: AcquisitionBox[] = [
  {
    id: 'B01',
    name: '1号手术间采集盒',
    ip: '192.168.10.101',
    mac: '00:1A:C2:7B:82:11',
    model: 'MedGate-Pro 400',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第一手术部',
    physicalLocation: '总院区 第一手术部 手术间 01 (心胸数字化) 吊塔设备柜 A01',
    room: '手术间 01 (心胸数字化)',
    status: 'NORMAL',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-01'],
    connectedLineIds: ['L01', 'L02'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full, VLAN 102)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '多参数监护仪 BeneVision N17', baudRate: 115200 },
      { portNumber: 8002, type: 'RS232', boundLineId: 'L02', boundDeviceName: '多参数监护仪 BeneVision N17 (气体模块)', baudRate: 115200 }
    ],
    notes: '双线正常入库，生命体征与气体模块流平稳。'
  },
  {
    id: 'B02',
    name: '2号手术间采集盒',
    ip: '192.168.10.102',
    mac: '00:1A:C2:7B:82:12',
    model: 'MedGate-Pro 400',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第一手术部',
    physicalLocation: '总院区 第一手术部 手术间 02 (神经外科) 吊塔中控机柜 B01',
    room: '手术间 02 (神经外科)',
    status: 'PARTIAL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-02'],
    connectedLineIds: ['L01', 'L02'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full, VLAN 102)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '双通道监护仪 BeneVision N15', baudRate: 115200 },
      { portNumber: 8002, type: 'RS232', boundLineId: 'L02', boundDeviceName: '双通道监护仪 BeneVision N15 (BIS麻醉深度)', baudRate: 9600 }
    ],
    notes: '【典型业务】同盒L01正常(1390点)，L02无数据(0点)，诊断L02时自动跳过Ping。'
  },
  {
    id: 'B03',
    name: '3号手术间采集盒',
    ip: '192.168.10.103',
    mac: '00:1A:C2:7B:82:13',
    model: 'MedGate-Pro 400',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第一手术部',
    physicalLocation: '总院区 第一手术部 手术间 03 (骨科手术室) 吊塔电源柜 C01',
    room: '手术间 03 (骨科手术室)',
    status: 'ALL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-03'],
    connectedLineIds: ['L01'],
    powerStatus: 'OFFLINE',
    uplinkPort: 'ETH0 (Link Down, 疑似网线松脱)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '麻醉工作站 Primus', baudRate: 19200 }
    ],
    notes: '采集盒疑似断电或网线被拔掉，Ping失败，需现场检查。'
  },
  {
    id: 'B04',
    name: '4号手术间采集盒',
    ip: '192.168.10.104',
    mac: '00:1A:C2:7B:82:14',
    model: 'MedGate-Standard 300',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第一手术部',
    physicalLocation: '总院区 第一手术部 手术间 04 (普外腔镜) 移动推车内',
    room: '手术间 04 (普外腔镜)',
    status: 'ALL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-04'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (100Mbps Full, VLAN 102)',
    downlinkPorts: [
      { portNumber: 8001, type: 'ETH_RJ45', boundLineId: 'L01', boundDeviceName: '监护仪 IntelliVue MX800' }
    ],
    notes: 'Ping通但读不到预期线号L01，线缆可能脱落。'
  },
  {
    id: 'B05',
    name: '5号手术间采集盒',
    ip: '192.168.10.105',
    mac: '00:1A:C2:7B:82:15',
    model: 'MedGate-Pro 400',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第一手术部',
    physicalLocation: '总院区 第一手术部 手术间 05 (心血管外科) 吊塔B侧',
    room: '手术间 05 (心血管外科)',
    status: 'ALL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-05'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full, VLAN 102)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '重症呼吸机 Servo-i', baudRate: 9600 }
    ],
    notes: 'fopen打开配置文件失败。'
  },
  {
    id: 'B06',
    name: '6号手术间采集盒',
    ip: '192.168.10.106',
    mac: '00:1A:C2:7B:82:16',
    model: 'MedGate-Standard 300',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第一手术部',
    physicalLocation: '总院区 第一手术部 手术间 06 (妇产科手术间) 麻醉吊塔下部',
    room: '手术间 06 (妇产科手术间)',
    status: 'ALL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-06'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full, VLAN 102)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '麻醉工作站 Avance CS2', baudRate: 19200 }
    ],
    notes: '平台配置下发超时。'
  },
  {
    id: 'B07',
    name: '7号手术间采集盒',
    ip: '192.168.10.107',
    mac: '00:1A:C2:7B:82:17',
    model: 'MedGate-Pro 400',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第一手术部',
    physicalLocation: '总院区 第一手术部 手术间 07 (泌尿外科) 腔镜推车',
    room: '手术间 07 (泌尿外科)',
    status: 'ALL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-07'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '监护仪 BeneVision N12', baudRate: 115200 }
    ],
    notes: 'fclose保存失败（存储介质只读保护）。'
  },
  {
    id: 'B08',
    name: '8号手术间采集盒',
    ip: '192.168.10.108',
    mac: '00:1A:C2:7B:82:18',
    model: 'MedGate-Lite 200',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第一手术部',
    physicalLocation: '总院区 第一手术部 手术间 08 (日间手术室) 设备柜01',
    room: '手术间 08 (日间手术室)',
    status: 'ALL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-08'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (100Mbps Full)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '智能呼吸机 Hamilton-G5', baudRate: 19200 }
    ],
    notes: 'attach应用下行串口驱动失败。'
  },
  {
    id: 'B09',
    name: '9号手术间采集盒',
    ip: '192.168.10.109',
    mac: '00:1A:C2:7B:82:19',
    model: 'MedGate-Pro 400',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第一手术部',
    physicalLocation: '总院区 第一手术部 手术间 09 (五官头颈外科) 麻醉吊塔机柜',
    room: '手术间 09 (五官头颈外科)',
    status: 'ALL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-09'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '麻醉机 Primus', baudRate: 19200 }
    ],
    notes: 'attach OK但recv=0，设备侧无数据输出。'
  },
  {
    id: 'B10',
    name: '10号手术间采集盒',
    ip: '192.168.10.110',
    mac: '00:1A:C2:7B:82:20',
    model: 'MedGate-Pro 400',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第二手术部',
    physicalLocation: '总院区 第二手术部 手术间 10 (数字化复合杂交) 铅房控制室机柜',
    room: '手术间 10 (数字化复合杂交)',
    status: 'ALL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-10'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '监护仪 BeneVision N17', baudRate: 115200 }
    ],
    notes: 'attach OK, recv>0, 确认有患者使用 -> 网关解析入库阻塞。'
  },
  {
    id: 'B11',
    name: '11号手术间采集盒',
    ip: '192.168.10.111',
    mac: '00:1A:C2:7B:82:21',
    model: 'MedGate-Pro 400',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第二手术部',
    physicalLocation: '总院区 第二手术部 手术间 11 (急诊抢救手术间) 吊塔设备柜',
    room: '手术间 11 (急诊抢救手术间)',
    status: 'ALL_NO_DATA',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-11'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full)',
    downlinkPorts: [
      { portNumber: 8001, type: 'ETH_RJ45', boundLineId: 'L01', boundDeviceName: '多参数监护仪 IntelliVue MX700' }
    ],
    notes: 'attach OK, recv>0, 确认无患者使用 -> 空载闲置符合预期。'
  },
  {
    id: 'B12',
    name: '12号手术间采集盒',
    ip: '192.168.10.112',
    mac: '00:1A:C2:7B:82:22',
    model: 'MedGate-Standard 300',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '第二手术部',
    physicalLocation: '总院区 第二手术部 手术间 12 (儿科手术室) 麻醉车01',
    room: '手术间 12 (儿科手术室)',
    status: 'QUERY_ERROR',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-12'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '麻醉工作站 Perseus A500', baudRate: 19200 }
    ],
    notes: '时序数据库连接超时，独立标记为查询失败。'
  },
  {
    id: 'B14',
    name: 'PACU-02采集盒',
    ip: '192.168.10.114',
    mac: '00:1A:C2:7B:82:24',
    model: 'MedGate-Lite 200',
    firmware: 'V2.4.12-build2025',
    campus: '总院区',
    department: '麻醉复苏部PACU',
    physicalLocation: '总院区 麻醉复苏部PACU 床位 02 呼叫带旁',
    room: 'PACU 床位 02',
    status: 'NORMAL',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-14'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (100Mbps Full)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '麻醉苏醒监护仪 BeneVision N12', baudRate: 115200 }
    ],
    notes: '入库数据平稳。'
  },
  {
    id: 'B15',
    name: 'ICU-01采集盒',
    ip: '192.168.20.101',
    mac: '00:1A:C2:7B:83:01',
    model: 'MedGate-Pro 400',
    firmware: 'V2.4.12-build2025',
    campus: '东院区',
    department: '重症医学科ICU',
    physicalLocation: '东院区 重症医学科ICU 负压隔离间 01 吊桥机箱',
    room: 'ICU 负压隔离间 01',
    status: 'NORMAL',
    lastInspectionTime: '2026-10-20 20:10:00',
    connectedDeviceIds: ['DEV-15'],
    connectedLineIds: ['L01'],
    powerStatus: 'AC_ONLINE',
    uplinkPort: 'ETH0 (1000Mbps Full)',
    downlinkPorts: [
      { portNumber: 8001, type: 'RS232', boundLineId: 'L01', boundDeviceName: '重症呼吸机 Hamilton-C6', baudRate: 19200 }
    ],
    notes: '东院区呼吸机闭环数据流平稳。'
  }
];

// 历史批量巡检批次记录列表 (总结正常异常数据)
export const MOCK_BATCH_INSPECTION_HISTORY: BatchInspectionHistoryRecord[] = [
  {
    id: 'INS-20261020-003',
    inspectTime: '2026-10-20 20:10:00',
    operator: '系统自动周期巡检',
    scopeCampus: '全部院区',
    scopeDept: '全部手术部及重症科室',
    durationMs: 124,
    totalBoxes: 14,
    totalDevices: 15,
    totalLines: 19,
    normalCount: 5,
    abnormalCount: 9,
    partialNoDataCount: 1,
    allNoDataCount: 7,
    queryErrorCount: 1,
    anomalousSnapshots: [
      { boxId: 'B02', boxIp: '192.168.10.102', room: '手术间 02', deviceName: 'BeneVision N15', lineId: 'L02', issueSummary: '同盒L01正常(1390点)，L02无数据(0点)', status: 'PARTIAL_NO_DATA' },
      { boxId: 'B03', boxIp: '192.168.10.103', room: '手术间 03', deviceName: 'Primus', lineId: 'L01', issueSummary: '采集盒网络不可达/断电', status: 'OFFLINE' },
      { boxId: 'B04', boxIp: '192.168.10.104', room: '手术间 04', deviceName: 'IntelliVue MX800', lineId: 'L01', issueSummary: '在线但读不到预期线号', status: 'ALL_NO_DATA' },
      { boxId: 'B05', boxIp: '192.168.10.105', room: '手术间 05', deviceName: 'Servo-i', lineId: 'L01', issueSummary: 'fopen打开L01.json失败', status: 'ALL_NO_DATA' },
      { boxId: 'B06', boxIp: '192.168.10.106', room: '手术间 06', deviceName: 'Avance CS2', lineId: 'L01', issueSummary: '平台配置下发超时', status: 'ALL_NO_DATA' },
      { boxId: 'B07', boxIp: '192.168.10.107', room: '手术间 07', deviceName: 'BeneVision N12', lineId: 'L01', issueSummary: 'fclose保存失败(只读介质)', status: 'ALL_NO_DATA' },
      { boxId: 'B08', boxIp: '192.168.10.108', room: '手术间 08', deviceName: 'Hamilton-G5', lineId: 'L01', issueSummary: 'attach下行端口失败', status: 'ALL_NO_DATA' },
      { boxId: 'B09', boxIp: '192.168.10.109', room: '手术间 09', deviceName: 'Primus', lineId: 'L01', issueSummary: 'attach OK 但 recv = 0 (设备无输出)', status: 'ALL_NO_DATA' },
      { boxId: 'B12', boxIp: '192.168.10.112', room: '手术间 12', deviceName: 'Perseus A500', lineId: 'L01', issueSummary: '时序数据库查询超时', status: 'QUERY_ERROR' }
    ]
  },
  {
    id: 'INS-20261020-002',
    inspectTime: '2026-10-20 16:00:00',
    operator: '值班工程师-李工 (手动执行)',
    scopeCampus: '总院区',
    scopeDept: '第一手术部',
    durationMs: 98,
    totalBoxes: 9,
    totalDevices: 9,
    totalLines: 10,
    normalCount: 4,
    abnormalCount: 5,
    partialNoDataCount: 1,
    allNoDataCount: 4,
    queryErrorCount: 0,
    anomalousSnapshots: [
      { boxId: 'B02', boxIp: '192.168.10.102', room: '手术间 02', deviceName: 'BeneVision N15', lineId: 'L02', issueSummary: 'L02无数据', status: 'PARTIAL_NO_DATA' },
      { boxId: 'B03', boxIp: '192.168.10.103', room: '手术间 03', deviceName: 'Primus', lineId: 'L01', issueSummary: '采集盒脱网', status: 'OFFLINE' },
      { boxId: 'B04', boxIp: '192.168.10.104', room: '手术间 04', deviceName: 'IntelliVue MX800', lineId: 'L01', issueSummary: '未读取到线号', status: 'ALL_NO_DATA' }
    ]
  },
  {
    id: 'INS-20261020-001',
    inspectTime: '2026-10-20 08:30:00',
    operator: '晨间开台全网自动批量巡检',
    scopeCampus: '全部院区',
    scopeDept: '全部科室',
    durationMs: 145,
    totalBoxes: 14,
    totalDevices: 15,
    totalLines: 19,
    normalCount: 8,
    abnormalCount: 6,
    partialNoDataCount: 0,
    allNoDataCount: 6,
    queryErrorCount: 0,
    anomalousSnapshots: [
      { boxId: 'B03', boxIp: '192.168.10.103', room: '手术间 03', deviceName: 'Primus', lineId: 'L01', issueSummary: '开机前未插电源', status: 'OFFLINE' }
    ]
  },
  {
    id: 'INS-20261019-004',
    inspectTime: '2026-10-19 22:30:00',
    operator: '夜间例行自动巡检',
    scopeCampus: '全部院区',
    scopeDept: '全部科室',
    durationMs: 110,
    totalBoxes: 14,
    totalDevices: 15,
    totalLines: 19,
    normalCount: 11,
    abnormalCount: 3,
    partialNoDataCount: 0,
    allNoDataCount: 3,
    queryErrorCount: 0,
    anomalousSnapshots: [
      { boxId: 'B03', boxIp: '192.168.10.103', room: '手术间 03', deviceName: 'Primus', lineId: 'L01', issueSummary: '采集盒离线', status: 'OFFLINE' }
    ]
  }
];

