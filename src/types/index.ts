/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 采集线号状态
export type LineStatus = 
  | 'NORMAL'             // 正常采集（近5分钟有数据）
  | 'NO_DATA_PENDING'    // 无数据待诊断（近5分钟无数据）
  | 'QUERY_FAILED'       // 数据库查询异常
  | 'CONFIG_INCOMPLETE'; // 绑定不完整

// 设备聚合状态
export type DeviceAggregateStatus = 
  | 'NORMAL'             // 全部正常
  | 'PARTIAL_NO_DATA'    // 部分线无数据
  | 'ALL_NO_DATA'        // 全部无数据待诊断
  | 'QUERY_ERROR'        // 查询失败
  | 'BINDING_INCOMPLETE';// 绑定不完整

// 诊断步骤状态
export type StepStatus = 
  | 'SUCCESS'     // 成功 (绿色)
  | 'FAILED'      // 失败 (红色)
  | 'RUNNING'     // 执行中 (蓝色旋转)
  | 'SKIPPED'     // 跳过 (紫/灰，如具备同盒在线证据跳过Ping)
  | 'PENDING';    // 未执行 (灰色)

// 责任归属
export type ResponsibleRole = 
  | 'FIELD_ENGINEER'   // 现场交付/运维人员
  | 'GATEWAY_ENGINEER' // 网关/物联网后端工程师
  | 'CLINICAL_STAFF'   // 临床科室护士/技师
  | 'SYSTEM_ADMIN';    // 系统管理员

// 线号数据模型
export interface DeviceLine {
  lineId: string;             // 例如: "L01", "L02"
  lineName: string;           // 例如: "生理监护波形与主参数", "呼末CO2/麻醉深度模块"
  boxIp: string;              // 采集盒 IP
  port: number;               // 采集盒下行串口号/网络端口 (如 COM1 / 8001)
  status: LineStatus;         // 当前状态
  dataCount5Min: number;      // 近5分钟入库数据条数
  lastDataTime: string | null;// 最后一条数据入库时间
  lastDiagnosisTime?: string; // 最近诊断时间
  lastDiagnosisResult?: string;
  expectedDataRateHz?: number; // 预期采样频率 (Hz)
  protocol: string;           // 协议类型，如 "Mindray-eGateway", "Philips-IntelliBridge", "Serial-HL7"
}

// 设备数据模型
export interface MedicalDevice {
  id: string;
  code: string;               // 资产编号，如 "DEV-2024-OR03-01"
  name: string;               // 如 "多参数监护仪 BeneVision N17"
  category: 'MONITOR' | 'ANESTHESIA' | 'VENTILATOR' | 'DEFIBRILLATOR' | 'INFUSION';
  model: string;              // 如 "BeneVision N17"
  manufacturer: string;       // 如 "迈瑞医疗 (Mindray)"
  campus: string;             // 院区，如 "总院区"
  department: string;         // 手术部，如 "第一手术部"
  room: string;               // 手术间，如 "手术间 03 (骨科数字化手术室)"
  boxIp: string;              // 绑定的采集盒 IP
  boxMac?: string;            // 采集盒 MAC
  boxFirmware?: string;       // 采集盒固件版本
  lines: DeviceLine[];        // 绑定的线号集合 (1条或多条)
  aggregateStatus: DeviceAggregateStatus;
  notes?: string;
}

// 设备型号规则定义
export interface DeviceModelRule {
  id: string;
  model: string;
  manufacturer: string;
  category: string;
  expectedLineCount: number;
  hasRecvWithoutPatient: boolean;  // 无患者时下行口是否有 recv (例如某些监护仪只要开机即使没患者也发心电导联脱落报文)
  allowNoDataStorage: boolean;     // 无患者时是否允许空数据入库 (false表示无患者时不入库符合预期)
  idlePacketDescription: string;   // 闲置状态报文特征
  typicalProtocol: string;
  guideUrl?: string;
}

// 诊断步骤详情
export interface DiagnosisStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: StepStatus;
  durationMs?: number;
  timestamp?: string;
  skipReason?: string;
  evidenceSummary?: string;
  evidenceDetails?: {
    requestPayload?: string;
    responsePayload?: string;
    rttMs?: number;
    metrics?: Record<string, any>;
    logSnippet?: string[];
  };
}

// 诊断日志条目
export interface DiagnosticLogItem {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TRACE';
  source: string; // "GATEWAY_SERVICE" | "BOX_CLIENT" | "DB_CONNECTOR" | "PARSER"
  message: string;
  rawPayload?: string;
}

// 单项诊断记录 (存储于诊断历史)
export interface DiagnosticRecord {
  id: string;
  recordTime: string;
  boxId?: string;             // 采集盒简写编号，如 "B01", "B02"
  boxModel?: string;          // 采集盒型号，如 "MedGate-Pro 400"
  campus?: string;            // 院区
  department?: string;        // 科室/手术部
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  room: string;
  boxIp: string;
  targetLineId: string;
  coBoxLinesSummary: string;
  
  // 步骤
  steps: DiagnosisStep[];
  
  // 结论
  conclusionTitle: string;
  conclusionType: 'NORMAL' | 'BOX_OFFLINE' | 'LINE_DISCONNECTED' | 'CONFIG_ERROR' | 'NO_DEVICE_OUTPUT' | 'DB_INGESTION_BLOCKED' | 'IDLE_EXPECTED' | 'MANUAL_INSPECTION_NEEDED';
  severity: 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'INFO';
  responsibleRole: ResponsibleRole;
  actionAdvice: string[];
  
  // 患者使用状态调查 (若有)
  patientInUseStatus?: 'YES' | 'NO' | 'UNKNOWN';
  
  // 原始日志
  logs: DiagnosticLogItem[];
  
  // 处理工单流转
  handlingStatus: 'UNHANDLED' | 'TRANSFERRED' | 'RESOLVED' | 'VERIFIED';
  transferredTo?: string;
  transferNote?: string;
  resolvedNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

// 一键批量巡检任务状态
export interface BatchInspectionTask {
  taskId: string;
  startTime: string;
  endTime?: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'STOPPED';
  totalDevices: number;
  totalLines: number;
  scannedDevices: number;
  scannedLines: number;
  normalCount: number;
  partialNoDataCount: number;
  allNoDataCount: number;
  queryErrorCount: number;
  bindingIncompleteCount: number;
  durationMs: number;
}

// 采集设备盒子状态
export type BoxInspectionStatus = 
  | 'NORMAL'             // 采集正常
  | 'PARTIAL_NO_DATA'    // 部分线无数据
  | 'ALL_NO_DATA'        // 全部无数据待诊断
  | 'OFFLINE'            // 盒子离线/Ping不通
  | 'QUERY_ERROR'        // 数据库查询异常
  | 'UNINSPECTED';       // 尚未巡检

// 采集设备盒子下行物理端口
export interface DownlinkPortConfig {
  portNumber: number;
  type: 'RS232' | 'RS485' | 'ETH_RJ45';
  boundLineId?: string;
  boundDeviceName?: string;
  baudRate?: number;
}

// 采集设备盒子实体模型 (以采集盒为主的一级实体)
export interface AcquisitionBox {
  id: string;                 // 盒子ID，如 "BOX-OR01-01"
  name: string;               // 盒子名称，如 "1号手术室吊塔主采集盒"
  ip: string;                 // IP地址，如 "192.168.10.101"
  mac: string;                // MAC地址，如 "00:1A:C2:7B:82:11"
  model: string;              // 盒子版本型号，如 "MedGate-Pro 400"
  firmware: string;           // 固件版本，如 "V2.4.12-build2025"
  campus: string;             // 院区，如 "总院区"
  department: string;         // 手术部，如 "第一手术部"
  physicalLocation: string;   // 物理地点，如 "手术间 01 (心胸数字化) - 吊塔设备柜 A02"
  room: string;               // 手术间简称，如 "手术间 01"
  status: BoxInspectionStatus;// 上次巡检状态
  currentStatus?: BoxInspectionStatus; // 本次巡检状态 (巡检后更新)
  lastInspectionTime: string; // 上次巡检时间
  connectedDeviceIds: string[]; // 连接的医疗设备ID列表 (有几台)
  connectedLineIds: string[];  // 挂载的线号列表
  powerStatus: 'AC_ONLINE' | 'BATTERY' | 'OFFLINE'; // 供电状态
  uplinkPort: string;         // 上行网口，如 "ETH0 (1000Mbps Full)"
  downlinkPorts: DownlinkPortConfig[];
  notes?: string;
}

// 历史批量巡检批次记录
export interface BatchInspectionHistoryRecord {
  id: string;                 // 批次号，如 "INS-20261020-001"
  inspectTime: string;        // 巡检时间
  operator: string;           // 触发人，如 "系统定时任务" 或 "工程师-张峰"
  scopeCampus: string;        // 巡检范围院区
  scopeDept: string;          // 巡检范围科室
  durationMs: number;         // 耗时(ms)
  totalBoxes: number;         // 扫描盒子数
  totalDevices: number;       // 扫描设备数
  totalLines: number;         // 扫描线号数
  normalCount: number;        // 正常采集数
  abnormalCount: number;      // 异常数 (部分无数据 + 全部无数据 + 离线 + 查询错误)
  partialNoDataCount: number; // 部分线无数据数
  allNoDataCount: number;     // 全部无数据数
  queryErrorCount: number;    // 查询错误数
  anomalousSnapshots: {
    boxId: string;
    boxIp: string;
    room: string;
    deviceName: string;
    lineId: string;
    issueSummary: string;
    status: BoxInspectionStatus;
  }[];
}

