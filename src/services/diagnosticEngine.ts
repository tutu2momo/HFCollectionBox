/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  MedicalDevice, 
  DeviceLine, 
  DiagnosisStep, 
  DiagnosticLogItem, 
  DiagnosticRecord,
  ResponsibleRole
} from '../types';
import { MOCK_MODEL_RULES } from '../mock/seedData';

// 模拟格式化时间
export function getNowTimeString(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export function getShortTime(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${Math.floor(Math.random() * 900 + 100)}`;
}

// 诊断执行器选项
export interface DiagnosticRunOptions {
  device: MedicalDevice;
  targetLine: DeviceLine;
  allDevices: MedicalDevice[];
  boxId?: string;
  boxModel?: string;
  // 如果是预设模式或交互模式，指定特定分支
  presetBranch?: string;
  patientStatus?: 'YES' | 'NO' | 'UNKNOWN';
  onStepUpdate?: (steps: DiagnosisStep[], currentLogs: DiagnosticLogItem[], isWaitingPatient?: boolean) => void;
}

// 核心诊断引擎：根据两阶段业务规则执行第二阶段单项诊断
export async function executeSingleLineDiagnosis(
  options: DiagnosticRunOptions
): Promise<DiagnosticRecord> {
  const { device, targetLine, allDevices, patientStatus } = options;
  const startTime = getNowTimeString();
  const recordId = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const steps: DiagnosisStep[] = [
    {
      id: 'step-1',
      stepNumber: 1,
      title: '同盒共存与网络连通性检查',
      description: '先检查同盒其他线号是否已有在线数据；仅全部无数据时才 Ping 盒子 IP',
      status: 'PENDING'
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: '读取预期线号配置',
      description: '建立采集盒会话，校验预期线号注册信息及下行通道映射',
      status: 'PENDING'
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'fopen 打开配置描述文件',
      description: `打开采集盒内置 <${targetLine.lineId}>.json 配置文件`,
      status: 'PENDING'
    },
    {
      id: 'step-4',
      stepNumber: 4,
      title: '平台配置下发与校验',
      description: '网关向采集盒下发协议解析参数表与过滤规则',
      status: 'PENDING'
    },
    {
      id: 'step-5',
      stepNumber: 5,
      title: 'fclose 保存并关闭配置文件',
      description: '落盘保存配置并释放文件锁',
      status: 'PENDING'
    },
    {
      id: 'step-6',
      stepNumber: 6,
      title: 'attach 应用下行端口',
      description: '绑定下行串口/网口，激活底层通信驱动与数据监听',
      status: 'PENDING'
    },
    {
      id: 'step-7',
      stepNumber: 7,
      title: 'recv 报文接收检查',
      description: '检测采集盒下行口实际收到的物理报文 (recv > 0 还是 recv = 0)',
      status: 'PENDING'
    },
    {
      id: 'step-8',
      stepNumber: 8,
      title: '平台数据库入库核验',
      description: '核实网关解析入库管道是否正在生成体征时序数据',
      status: 'PENDING'
    }
  ];

  const logs: DiagnosticLogItem[] = [];

  const addLog = (level: DiagnosticLogItem['level'], source: string, message: string, rawPayload?: string) => {
    const item: DiagnosticLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: getShortTime(),
      level,
      source,
      message,
      rawPayload
    };
    logs.push(item);
    if (options.onStepUpdate) {
      options.onStepUpdate([...steps], [...logs]);
    }
  };

  addLog('INFO', 'DIAG_ORCHESTRATOR', `开始单项诊断：设备 ${device.name} (${device.code}), 线号 [${targetLine.lineId}], 采集盒 IP [${device.boxIp}]`);

  // 1. 查找同盒其他线号
  const sameBoxDevices = allDevices.filter(d => d.boxIp === device.boxIp);
  const otherLinesOnSameBox: { devName: string; line: DeviceLine }[] = [];
  sameBoxDevices.forEach(d => {
    d.lines.forEach(l => {
      if (l.lineId !== targetLine.lineId || d.id !== device.id) {
        otherLinesOnSameBox.push({ devName: d.name, line: l });
      }
    });
  });

  const hasAnyOtherLineWithData = otherLinesOnSameBox.some(item => item.line.dataCount5Min > 0);
  const coBoxSummaryText = otherLinesOnSameBox.length > 0 
    ? otherLinesOnSameBox.map(o => `${o.line.lineId}(${o.line.dataCount5Min}点/5min)`).join(', ')
    : '单线设备，同盒无其他线';

  // 针对预设场景的分支判断 (通过 device.id / device.notes)
  const devId = device.id;
  const isDev02PartialNoData = devId === 'DEV-02';
  const isDev03PingFail = devId === 'DEV-03';
  const isDev04NoExpectedLine = devId === 'DEV-04';
  const isDev05FopenFail = devId === 'DEV-05';
  const isDev06ConfigPushFail = devId === 'DEV-06';
  const isDev07FcloseFail = devId === 'DEV-07';
  const isDev08AttachFail = devId === 'DEV-08';
  const isDev09RecvZero = devId === 'DEV-09';
  const isDev10PatientInUse = devId === 'DEV-10';
  const isDev11PatientIdle = devId === 'DEV-11';
  const isDev12QueryError = devId === 'DEV-12';
  const isDev13Unbound = devId === 'DEV-13';

  // 模拟稍微的异步延迟，让UI演示像真实诊断
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  // --- 步骤 1：同盒共存检查与 Ping ---
  steps[0].status = 'RUNNING';
  addLog('INFO', 'RULE_ENGINE', `核查采集盒 ${device.boxIp} 拓扑与同盒共存线号... 发现 ${otherLinesOnSameBox.length} 条关联线号`);
  await sleep(350);

  if (isDev02PartialNoData || hasAnyOtherLineWithData) {
    // 关键业务规则：同盒其他线号近5分钟有数据，跳过 Ping 并明确证据！
    steps[0].status = 'SKIPPED';
    steps[0].skipReason = `同盒其他线号 (${otherLinesOnSameBox.map(o => o.line.lineId).join('/')}) 近 5 分钟有数据，已具备采集盒与网络在线证据，按规则跳过 Ping。`;
    steps[0].evidenceSummary = '免测 Ping：同盒其他线号物理链路正常、上行网络通畅，已取得强在线证据。';
    steps[0].durationMs = 12;
    addLog('INFO', 'RULE_ENGINE', `【规则触发】同盒其他线号正常入库，判定采集盒与上行网关在线，豁免 Ping 测试，进入下行线号检测`);
  } else if (isDev03PingFail) {
    // Ping 失败分支
    addLog('WARN', 'GATEWAY_DIAG', `同盒全部线号无数据，发起网关侧 ICMP Ping -> ${device.boxIp}`);
    await sleep(400);
    addLog('ERROR', 'GATEWAY_DIAG', `PING ${device.boxIp} (32 bytes): Request timed out.`);
    addLog('ERROR', 'GATEWAY_DIAG', `PING ${device.boxIp} (32 bytes): Destination Host Unreachable. (100% loss)`);
    steps[0].status = 'FAILED';
    steps[0].durationMs = 2850;
    steps[0].evidenceSummary = `Ping ${device.boxIp} 失败：4 包全部丢失 (100% Packet Loss)，网络不可达。`;
    steps[0].evidenceDetails = {
      rttMs: -1,
      metrics: { transmitted: 4, received: 0, lossRate: '100%' },
      logSnippet: [
        `PING ${device.boxIp}: icmp_seq=1 Destination Host Unreachable`,
        `PING ${device.boxIp}: icmp_seq=2 Request timed out`,
        `PING ${device.boxIp}: icmp_seq=3 Request timed out`
      ]
    };
    addLog('ERROR', 'DIAG_ORCHESTRATOR', `步骤1诊断失败：采集盒离线。阻断后续步骤。`);

    return {
      id: recordId,
      recordTime: startTime,
      deviceId: device.id,
      deviceName: device.name,
      deviceModel: device.model,
      room: device.room,
      boxIp: device.boxIp,
      targetLineId: targetLine.lineId,
      coBoxLinesSummary: coBoxSummaryText,
      steps,
      conclusionTitle: '采集盒网络不可达 / 硬件掉电或脱网',
      conclusionType: 'BOX_OFFLINE',
      severity: 'CRITICAL',
      responsibleRole: 'FIELD_ENGINEER',
      actionAdvice: [
        '现场检查手术室吊塔/设备推车上采集盒指示灯状态（电源灯 PWR 是否常亮、网口 LINK 是否闪烁）',
        '检查采集盒电源适配器是否插紧，网线水晶头是否松动或被医护推车拉扯断裂',
        '检查对应交换机端口及 VLAN 配置是否正常，若供电与网线正常仍不通，建议更换备用采集盒'
      ],
      logs,
      handlingStatus: 'UNHANDLED'
    };
  } else {
    // 正常通过 Ping
    addLog('INFO', 'GATEWAY_DIAG', `同盒无在线数据，发起网关 ICMP Ping -> ${device.boxIp}`);
    await sleep(250);
    addLog('INFO', 'GATEWAY_DIAG', `PING ${device.boxIp}: icmp_seq=1 ttl=64 time=1.82ms`);
    steps[0].status = 'SUCCESS';
    steps[0].durationMs = 24;
    steps[0].evidenceSummary = `Ping ${device.boxIp} 正常，平均往返延迟 RTT = 1.82ms，网络通路畅通。`;
  }

  // --- 步骤 2：读取预期线号 ---
  steps[1].status = 'RUNNING';
  addLog('INFO', 'BOX_CLIENT', `连接采集盒 RPC 守护进程 (${device.boxIp}:9090)，查询注册线号列表...`);
  await sleep(300);

  if (isDev04NoExpectedLine) {
    // Ping 通但读不到预期线号
    steps[1].status = 'FAILED';
    steps[1].durationMs = 180;
    steps[1].evidenceSummary = `采集盒已在线，但在下行口注册映射表中未检索到预期线号 [${targetLine.lineId}] (仅找到空闲口分配)。`;
    steps[1].evidenceDetails = {
      logSnippet: [
        `RPC CALL: GetLineRegistry(box_ip="${device.boxIp}")`,
        `RESULT: registered_lines=[], expected_line="${targetLine.lineId}"`,
        `ERROR: LINE_NOT_ATTACHED_OR_DESERIALIZATION_EMPTY`
      ]
    };
    addLog('ERROR', 'BOX_CLIENT', `线号注册核对失败：无法定位预期线号 [${targetLine.lineId}] 的配置索引`);

    return {
      id: recordId,
      recordTime: startTime,
      deviceId: device.id,
      deviceName: device.name,
      deviceModel: device.model,
      room: device.room,
      boxIp: device.boxIp,
      targetLineId: targetLine.lineId,
      coBoxLinesSummary: coBoxSummaryText,
      steps,
      conclusionTitle: '采集盒已在线，但未读取到预期线号',
      conclusionType: 'LINE_DISCONNECTED',
      severity: 'WARNING',
      responsibleRole: 'FIELD_ENGINEER',
      actionAdvice: [
        '【优先级 1】请现场交付人员前往手术间，拍摄采集盒接口与物理线缆连接照片，检查线缆是否松脱/插错口',
        '【优先级 2】检查采集盒下行串口/网口线缆标签是否与系统台账线号 [${targetLine.lineId}] 一致',
        '【优先级 3】若现场确认物理接线牢固且接口正确仍读不到，再点击下方按钮“转交网关工程师”排查线号固件映射'
      ],
      logs,
      handlingStatus: 'UNHANDLED'
    };
  }

  steps[1].status = 'SUCCESS';
  steps[1].durationMs = 45;
  steps[1].evidenceSummary = `成功读取到预期线号 [${targetLine.lineId}]，端口映射: ${targetLine.port} (${targetLine.protocol})。`;
  addLog('INFO', 'BOX_CLIENT', `预期线号 [${targetLine.lineId}] 索引核验通过，下行绑定端口 ${targetLine.port}`);

  // --- 步骤 3：fopen 打开配置文件 ---
  steps[2].status = 'RUNNING';
  addLog('INFO', 'BOX_CLIENT', `执行 fopen("/etc/iot/lines/${targetLine.lineId}.json", "r") ...`);
  await sleep(280);

  if (isDev05FopenFail) {
    steps[2].status = 'FAILED';
    steps[2].durationMs = 62;
    steps[2].evidenceSummary = `打开 <${targetLine.lineId}.json> 失败：ENOENT 2 (No such file or directory) 或 权限被拒。`;
    steps[2].evidenceDetails = {
      logSnippet: [
        `sys_fopen("/etc/iot/lines/${targetLine.lineId}.json", O_RDONLY) = -1`,
        `errno: 2 (No such file or directory)`,
        `Reason: Local config template missing on gateway distribution repo`
      ]
    };
    addLog('ERROR', 'BOX_CLIENT', `fopen 失败：本地配置描述文件丢失或损坏`);

    return {
      id: recordId,
      recordTime: startTime,
      deviceId: device.id,
      deviceName: device.name,
      deviceModel: device.model,
      room: device.room,
      boxIp: device.boxIp,
      targetLineId: targetLine.lineId,
      coBoxLinesSummary: coBoxSummaryText,
      steps,
      conclusionTitle: 'fopen 打开配置文件失败（线号配置丢失）',
      conclusionType: 'CONFIG_ERROR',
      severity: 'CRITICAL',
      responsibleRole: 'GATEWAY_ENGINEER',
      actionAdvice: [
        `转交网关工程师排查平台配置文件发布流水线：线号 ${targetLine.lineId}.json 是否在网关侧生成`,
        '检查采集盒本地只读文件系统挂载状态，重新推送该型号标准解析配置文件'
      ],
      logs,
      handlingStatus: 'UNHANDLED'
    };
  }

  steps[2].status = 'SUCCESS';
  steps[2].durationMs = 38;
  steps[2].evidenceSummary = `fopen("${targetLine.lineId}.json") 成功，句柄 fd=8，文件长度 1024 字节。`;
  addLog('INFO', 'BOX_CLIENT', `fopen("${targetLine.lineId}.json") 句柄分配成功 (fd=8)`);

  // --- 步骤 4：配置下发与校验 ---
  steps[3].status = 'RUNNING';
  addLog('INFO', 'GATEWAY_SERVICE', `网关向采集盒下发协议驱动与规则参数包 (Size: 846B, Protocol: ${targetLine.protocol})...`);
  await sleep(320);

  if (isDev06ConfigPushFail) {
    steps[3].status = 'FAILED';
    steps[3].durationMs = 5200;
    steps[3].evidenceSummary = '网关下发配置超时：等待采集盒 ACK 超出 5000ms，通道管道拥塞。';
    addLog('ERROR', 'GATEWAY_SERVICE', `PUSH_CONFIG_TIMEOUT: no ACK from ${device.boxIp} within 5000ms`);

    return {
      id: recordId,
      recordTime: startTime,
      deviceId: device.id,
      deviceName: device.name,
      deviceModel: device.model,
      room: device.room,
      boxIp: device.boxIp,
      targetLineId: targetLine.lineId,
      coBoxLinesSummary: coBoxSummaryText,
      steps,
      conclusionTitle: '平台配置下发超时（下发链路异常）',
      conclusionType: 'CONFIG_ERROR',
      severity: 'CRITICAL',
      responsibleRole: 'GATEWAY_ENGINEER',
      actionAdvice: [
        '转交网关工程师检查网关消息下发队列（MQTT/RPC Pipe），排查通道阻塞或重试死锁',
        '网关侧测试向采集盒执行一次轻量级配置同步'
      ],
      logs,
      handlingStatus: 'UNHANDLED'
    };
  }

  steps[3].status = 'SUCCESS';
  steps[3].durationMs = 85;
  steps[3].evidenceSummary = '配置下发成功，采集盒返回校验确认包 (ACK-OK, MD5: 4a9f8b2c)。';
  addLog('INFO', 'GATEWAY_SERVICE', '配置参数校验通过，采集盒解析驱动就绪');

  // --- 步骤 5：fclose 保存关闭 ---
  steps[4].status = 'RUNNING';
  addLog('INFO', 'BOX_CLIENT', `执行 fclose(fd=8) 保存本地配置并刷写 Flash...`);
  await sleep(260);

  if (isDev07FcloseFail) {
    steps[4].status = 'FAILED';
    steps[4].durationMs = 95;
    steps[4].evidenceSummary = 'fclose 失败：存储介质只读 (EROFS: Read-only file system) 或 Flash 块校验损坏。';
    addLog('ERROR', 'BOX_CLIENT', 'fclose failed: EROFS 30 (Read-only file system)');

    return {
      id: recordId,
      recordTime: startTime,
      deviceId: device.id,
      deviceName: device.name,
      deviceModel: device.model,
      room: device.room,
      boxIp: device.boxIp,
      targetLineId: targetLine.lineId,
      coBoxLinesSummary: coBoxSummaryText,
      steps,
      conclusionTitle: 'fclose 保存配置失败（采集盒存储介质异常）',
      conclusionType: 'CONFIG_ERROR',
      severity: 'CRITICAL',
      responsibleRole: 'GATEWAY_ENGINEER',
      actionAdvice: [
        '转交网关工程师排查采集盒存储健康状态（Flash 文件系统是否异常置为只读）',
        '必要时由现场工程师在手术间空档期更换采集盒'
      ],
      logs,
      handlingStatus: 'UNHANDLED'
    };
  }

  steps[4].status = 'SUCCESS';
  steps[4].durationMs = 28;
  steps[4].evidenceSummary = 'fclose 成功返回 0，新配置已固化落盘。';
  addLog('INFO', 'BOX_CLIENT', 'fclose 成功，配置文件句柄释放完毕');

  // --- 步骤 6：attach 应用下行端口 ---
  steps[5].status = 'RUNNING';
  addLog('INFO', 'BOX_CLIENT', `执行 attach: 绑定下行物理端口 ${targetLine.port}，初始化协议驱动...`);
  await sleep(300);

  if (isDev08AttachFail) {
    steps[5].status = 'FAILED';
    steps[5].durationMs = 120;
    steps[5].evidenceSummary = `attach 下行串口失败：驱动返回 STATUS_PORT_BUSY (端口被其他进程占用或波特率不匹配)。`;
    addLog('ERROR', 'BOX_CLIENT', `attach(/dev/ttyS0, ${targetLine.port}) failed: BUSY or Parity mismatch`);

    return {
      id: recordId,
      recordTime: startTime,
      deviceId: device.id,
      deviceName: device.name,
      deviceModel: device.model,
      room: device.room,
      boxIp: device.boxIp,
      targetLineId: targetLine.lineId,
      coBoxLinesSummary: coBoxSummaryText,
      steps,
      conclusionTitle: 'attach 应用下行端口失败（驱动或端口占用）',
      conclusionType: 'CONFIG_ERROR',
      severity: 'CRITICAL',
      responsibleRole: 'GATEWAY_ENGINEER',
      actionAdvice: [
        '注意：attach 失败说明下行端口无法开启监听，后续步骤未执行',
        '转交网关工程师排查该线号串口参数定义（波特率、校验位、停止位）与采集盒固件兼容性'
      ],
      logs,
      handlingStatus: 'UNHANDLED'
    };
  }

  steps[5].status = 'SUCCESS';
  steps[5].durationMs = 62;
  steps[5].evidenceSummary = 'attach OK：下行串口/网络套接字监听已就绪，接收缓冲区分配成功。';
  addLog('INFO', 'BOX_CLIENT', '【关键说明】attach OK 仅代表配置流程走通，不代表设备正在发送有效数据');

  // --- 步骤 7：recv 报文接收检查 ---
  steps[6].status = 'RUNNING';
  addLog('INFO', 'BOX_CLIENT', `启动下行物理口报文监听 (窗口 1500ms)，检测设备是否正在发出字节流...`);
  await sleep(400);

  if (isDev09RecvZero) {
    // attach OK, 但 recv = 0
    steps[6].status = 'FAILED';
    steps[6].durationMs = 1500;
    steps[6].evidenceSummary = '监听超时：采集盒下行口在 1500ms 内未收到任何物理报文 (recv = 0)。';
    steps[6].evidenceDetails = {
      metrics: { recvBytes: 0, recvPackets: 0, rxErrors: 0 },
      logSnippet: [
        `ioctl(fd, FIONREAD) = 0`,
        `select timeout 1500ms expired, no byte arrived on port ${targetLine.port}`
      ]
    };
    addLog('WARN', 'BOX_CLIENT', 'recv 结果为 0：盒子下行口完全静默，医疗设备侧无任何信号输出');

    return {
      id: recordId,
      recordTime: startTime,
      deviceId: device.id,
      deviceName: device.name,
      deviceModel: device.model,
      room: device.room,
      boxIp: device.boxIp,
      targetLineId: targetLine.lineId,
      coBoxLinesSummary: coBoxSummaryText,
      steps,
      conclusionTitle: '设备侧无数据输出 (recv = 0)',
      conclusionType: 'NO_DEVICE_OUTPUT',
      severity: 'WARNING',
      responsibleRole: 'FIELD_ENGINEER',
      actionAdvice: [
        '【关键定性】采集盒与端口配置完全正常，问题在设备侧或连接线',
        '现场检查医疗设备是否开机并处于工作状态（而非 Standby 待机模式）',
        '检查医疗设备与采集盒之间的专用通讯转接线（如 D-Sub9 转 RJ45）两端是否插到位',
        '检查医疗设备后台系统设置中，数据输出协议端口（如 Data Export / Medibus）是否开启'
      ],
      logs,
      handlingStatus: 'UNHANDLED'
    };
  }

  // recv > 0 的情况
  steps[6].status = 'SUCCESS';
  steps[6].durationMs = 420;
  steps[6].evidenceSummary = 'recv 探测成功：采集盒下行口收到连续报文 (recv = 18 > 0, 速率 2.4KB/s)。';
  steps[6].evidenceDetails = {
    metrics: { recvBytes: 3680, recvPackets: 18, frameCheck: 'CRC_OK' },
    logSnippet: [
      `[RECV HEX] 0B 4D 53 48 7C 5E 7E 5C 26 7C 4D 49 4E 44 52 41 59 ...`,
      `Frame valid: Mindray eGateway packet detected`
    ]
  };
  addLog('INFO', 'BOX_CLIENT', '下行口已收到物理报文 (recv > 0)，设备物理输出正常');

  // --- 步骤 8：数据库入库核验与“是否有患者使用”逻辑 ---
  steps[7].status = 'RUNNING';
  addLog('INFO', 'DB_CONNECTOR', `核查时序数据库 (TimeScale/IoTDB) 近 5 分钟数据写入指标...`);
  await sleep(300);

  // 如果近5分钟无数据，且 recv > 0，必须触发“是否有患者使用”的核心判定逻辑！
  const rule = MOCK_MODEL_RULES.find(r => r.model.includes(device.model.split(' ')[0])) || MOCK_MODEL_RULES[0];

  if (targetLine.dataCount5Min === 0) {
    steps[7].status = 'FAILED';
    steps[7].durationMs = 85;
    steps[7].evidenceSummary = '核验未通过：近 5 分钟体征库写入记录为 0 条 (无入库记录)。';

    // 检查患者状态传入情况
    if (patientStatus === 'NO') {
      // 确认无患者使用
      addLog('INFO', 'CLINICAL_VERIFY', `【人工确认】现场核实当前设备无患者使用`);
      addLog('INFO', 'RULE_ENGINE', `结合型号规则 [${rule.model}]：无患者时仅发送心跳/空载帧，平台不入库符合预期。`);

      return {
        id: recordId,
        recordTime: startTime,
        deviceId: device.id,
        deviceName: device.name,
        deviceModel: device.model,
        room: device.room,
        boxIp: device.boxIp,
        targetLineId: targetLine.lineId,
        coBoxLinesSummary: coBoxSummaryText,
        steps,
        conclusionTitle: '设备闲置未接患者，符合预期',
        conclusionType: 'IDLE_EXPECTED',
        severity: 'INFO',
        responsibleRole: 'CLINICAL_STAFF',
        patientInUseStatus: 'NO',
        actionAdvice: [
          '【定性结论】下行口已收到报文(recv > 0)，但无真实患者生理体征，依据型号规则不入库符合设计预期',
          '待手术开台、患者佩戴心电导联/呼吸管路后，系统将自动开始入库，无需报修'
        ],
        logs,
        handlingStatus: 'VERIFIED',
        resolvedBy: '系统规则自动确认',
        resolvedAt: getNowTimeString(),
        resolvedNote: '现场确认无患者使用，符合空载不入库设计规范。'
      };
    } else if (patientStatus === 'YES') {
      // 确认有患者使用，但依然无入库 -> 明确是网关解析/上传/入库故障！
      addLog('WARN', 'CLINICAL_VERIFY', `【人工确认】现场确认当前设备有患者正在使用！`);
      addLog('ERROR', 'GATEWAY_SERVICE', `【严重故障】设备有患者且下行已收包(recv > 0)，但数据库5分钟无数据，判定网关解析或入库管道阻塞！`);

      return {
        id: recordId,
        recordTime: startTime,
        deviceId: device.id,
        deviceName: device.name,
        deviceModel: device.model,
        room: device.room,
        boxIp: device.boxIp,
        targetLineId: targetLine.lineId,
        coBoxLinesSummary: coBoxSummaryText,
        steps,
        conclusionTitle: '收到报文但未入库（网关解析/写库阻塞）',
        conclusionType: 'DB_INGESTION_BLOCKED',
        severity: 'CRITICAL',
        responsibleRole: 'GATEWAY_ENGINEER',
        patientInUseStatus: 'YES',
        actionAdvice: [
          '【关键证据】现场已确认患者在使用，且采集盒下行口已持续收到报文 (recv > 0)',
          '立即转交网关工程师排查：① 上行网关是否收到报文；② 解析模块是否崩溃；③ 消息中间件或数据库写入事务是否死锁',
          '优先检查网关 /var/log/iot-gateway/parse_error.log 日志'
        ],
        logs,
        handlingStatus: 'UNHANDLED'
      };
    } else {
      // 尚未确认患者状态，需要界面弹出交互核实
      return {
        id: recordId,
        recordTime: startTime,
        deviceId: device.id,
        deviceName: device.name,
        deviceModel: device.model,
        room: device.room,
        boxIp: device.boxIp,
        targetLineId: targetLine.lineId,
        coBoxLinesSummary: coBoxSummaryText,
        steps,
        conclusionTitle: '收到下行报文但未入库，需核实患者使用状态',
        conclusionType: 'MANUAL_INSPECTION_NEEDED',
        severity: 'WARNING',
        responsibleRole: 'FIELD_ENGINEER',
        patientInUseStatus: 'UNKNOWN',
        actionAdvice: [
          '【业务关键分支】当前采集盒下行口已收到报文 (recv > 0)，但数据库近 5 分钟无入库记录',
          '请在界面上方选择【当前设备是否有患者使用？】以进一步明确责任归属'
        ],
        logs,
        handlingStatus: 'UNHANDLED'
      };
    }
  }

  // 正常入库的分支
  steps[7].status = 'SUCCESS';
  steps[7].durationMs = 45;
  steps[7].evidenceSummary = `数据库近5分钟正常入库，采样率达标 (${targetLine.dataCount5Min}点)。`;
  addLog('INFO', 'DB_CONNECTOR', `入库检验正常，指标流平稳`);

  return {
    id: recordId,
    recordTime: startTime,
    deviceId: device.id,
    deviceName: device.name,
    deviceModel: device.model,
    room: device.room,
    boxIp: device.boxIp,
    targetLineId: targetLine.lineId,
    coBoxLinesSummary: coBoxSummaryText,
    steps,
    conclusionTitle: '全链路状态完好，采集与入库正常',
    conclusionType: 'NORMAL',
    severity: 'SUCCESS',
    responsibleRole: 'SYSTEM_ADMIN',
    actionAdvice: ['链路各节点测试通过，无需维护'],
    logs,
    handlingStatus: 'RESOLVED',
    resolvedBy: '自动巡检验证',
    resolvedAt: getNowTimeString()
  };
}
