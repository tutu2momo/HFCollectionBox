/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Play, ArrowRight, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';

export interface DemoScenario {
  id: string;
  category: 'NORMAL' | 'NETWORK' | 'BOX_CONFIG' | 'DEVICE_SIDE' | 'GATEWAY_DB' | 'SYSTEM_ANOMALY';
  title: string;
  deviceId: string;
  targetLineId: string;
  badge: string;
  badgeColor: string;
  coreRuleTested: string;
  expectedOutcome: string;
  responsibleRole: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'SC-01',
    category: 'NORMAL',
    title: '案例 1：双线全链路正常采集',
    deviceId: 'DEV-01',
    targetLineId: 'L01',
    badge: '全部正常',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    coreRuleTested: '第一阶段批量巡检确认两线均有入库数据；诊断时同盒L02在线跳过Ping，全链路验证通过。',
    expectedOutcome: '采集正常，无需故障报警，无需人工干预。',
    responsibleRole: '系统自动监控'
  },
  {
    id: 'SC-02',
    category: 'NORMAL',
    title: '案例 2：同盒双线-一条有数据一条无数据 (核心跳过Ping)',
    deviceId: 'DEV-02',
    targetLineId: 'L02',
    badge: '部分线无数据 · 跳过Ping',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    coreRuleTested: '【业务核心规则】同一盒子下L01正常入库(1390点)，诊断异常线L02时自动判定盒子在线，必须跳过Ping，并在时间轴清晰显示跳过依据！',
    expectedOutcome: '步骤1标为“已跳过(具备同盒在线证据)”，直接进入L02线号读取。',
    responsibleRole: '现场交付人员'
  },
  {
    id: 'SC-03',
    category: 'NETWORK',
    title: '案例 3：全线无数据且 Ping 失败 (断电/网线拔出)',
    deviceId: 'DEV-03',
    targetLineId: 'L01',
    badge: '盒子断电/离线',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    coreRuleTested: '同盒全部无数据，网关侧执行Ping。Ping失败阻断后续步骤，后续全标为“未执行”，禁标“失败”。',
    expectedOutcome: '结论“盒子/网络异常”，提示现场排查电源插头、指示灯与交换机网线。',
    responsibleRole: '现场交付人员'
  },
  {
    id: 'SC-04',
    category: 'BOX_CONFIG',
    title: '案例 4：Ping 通但读不到预期线号 (线缆脱落/插错口)',
    deviceId: 'DEV-04',
    targetLineId: 'L01',
    badge: '未读到预期线号',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    coreRuleTested: '盒子在线但查不到L01注册映射。先提示现场人员拍照核实物理接线，确认接线正常后再转网关工程师。',
    expectedOutcome: '步骤2失败，步骤3~8未执行。禁止未经证实直接判定设备硬件报废。',
    responsibleRole: '现场交付人员 -> 网关工程师'
  },
  {
    id: 'SC-05',
    category: 'BOX_CONFIG',
    title: '案例 5：fopen 打开 <线号>.json 失败',
    deviceId: 'DEV-05',
    targetLineId: 'L01',
    badge: 'fopen 失败',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    coreRuleTested: '无法打开配置文件描述符。步骤3失败，后续未执行，责任明确归网关侧配置生成服务。',
    expectedOutcome: '结论“fopen失败”，建议网关工程师核查配置推送流水线。',
    responsibleRole: '网关工程师'
  },
  {
    id: 'SC-06',
    category: 'BOX_CONFIG',
    title: '案例 6：平台配置下发超时 (管道拥塞)',
    deviceId: 'DEV-06',
    targetLineId: 'L01',
    badge: '配置下发超时',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    coreRuleTested: '网关向盒子推送协议包无ACK，步骤4超时失败，步骤5~8未执行。',
    expectedOutcome: '结论“平台配置下发超时”，交由网关工程师定位MQTT/RPC通道。',
    responsibleRole: '网关工程师'
  },
  {
    id: 'SC-07',
    category: 'BOX_CONFIG',
    title: '案例 7：fclose 保存失败 (存储介质只读)',
    deviceId: 'DEV-07',
    targetLineId: 'L01',
    badge: 'fclose 失败',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    coreRuleTested: '采集盒Flash文件系统损坏或置为只读(EROFS)，步骤5失败，后续未执行。',
    expectedOutcome: '结论“fclose保存失败”，现场工程师准备更换采集盒硬件。',
    responsibleRole: '网关工程师 / 现场交付'
  },
  {
    id: 'SC-08',
    category: 'BOX_CONFIG',
    title: '案例 8：attach 下行端口失败 (波特率或占用)',
    deviceId: 'DEV-08',
    targetLineId: 'L01',
    badge: 'attach 失败',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    coreRuleTested: '下行串口驱动绑定失败或参数冲突，步骤6失败，步骤7~8未执行。',
    expectedOutcome: '明确告知“attach失败代表驱动未激活，不可进入收包判断”，转网关工程师核对驱动。',
    responsibleRole: '网关工程师'
  },
  {
    id: 'SC-09',
    category: 'DEVICE_SIDE',
    title: '案例 9：attach OK 但 recv = 0 (设备侧静默)',
    deviceId: 'DEV-09',
    targetLineId: 'L01',
    badge: 'recv = 0 设备无输出',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    coreRuleTested: '【关键区分】attach OK仅代表配置流程通，不代表设备在发数据！recv=0提示检查设备电源、Standby模式、线缆与输出开关。',
    expectedOutcome: '不能武断断定设备故障，指导现场运维按标准顺序检查四项。',
    responsibleRole: '现场交付人员'
  },
  {
    id: 'SC-10',
    category: 'GATEWAY_DB',
    title: '案例 10：attach OK, recv > 0, 确认【有患者】 (网关解析入库阻塞)',
    deviceId: 'DEV-10',
    targetLineId: 'L01',
    badge: '有患者未入库 · 严重故障',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    coreRuleTested: '【业务高频核心】下行口已收到数据帧(recv>0)，弹窗核实确认“有患者使用”。结论锁定为“网关解析/写库阻塞”！',
    expectedOutcome: '判定为网关重大异常，紧急派发工单给网关值班工程师排查解析进程。',
    responsibleRole: '网关工程师'
  },
  {
    id: 'SC-11',
    category: 'NORMAL',
    title: '案例 11：attach OK, recv > 0, 确认【无患者】 (空载闲置符合预期)',
    deviceId: 'DEV-11',
    targetLineId: 'L01',
    badge: '无患者闲置 · 符合预期',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    coreRuleTested: '结合型号规则库，监护仪开机发心跳帧但无患者导联，平台过滤不入库属正常设计，非系统故障！',
    expectedOutcome: '结论定性为“设备未使用、符合预期”，归档为正常，不骚扰工程师。',
    responsibleRole: '临床科室 / 自动归档'
  },
  {
    id: 'SC-12',
    category: 'SYSTEM_ANOMALY',
    title: '案例 12：数据库连接池满 / 查询失败 (严禁说成无数据)',
    deviceId: 'DEV-12',
    targetLineId: 'L01',
    badge: '数据库查询异常',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    coreRuleTested: '【严禁混淆】数据库查询超时或SQL报错，必须独立呈现“查询失败”，绝对不能标记成“设备无数据”或“设备故障”！',
    expectedOutcome: '列表与明细明确标注“数据库查询异常”，提供“重新查询”操作。',
    responsibleRole: '数据库/运维DBA'
  },
  {
    id: 'SC-13',
    category: 'SYSTEM_ANOMALY',
    title: '案例 13：台账未绑定采集盒 IP (绑定不完整)',
    deviceId: 'DEV-13',
    targetLineId: 'L-UNBOUND',
    badge: '绑定不完整',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    coreRuleTested: '未分配采集盒IP或线号未关联，不可直接诊断，提示先完善系统基础台账。',
    expectedOutcome: '状态“绑定不完整”，操作栏禁止直接诊断，引导前往台账管理。',
    responsibleRole: '系统管理员'
  }
];

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
}

export const DemoScenariosModal: React.FC<DemoScenariosModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">演示案例切换器 (13组业务全分支)</span>
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                严格遵循两阶段规则
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              点击任意案例可立即在巡检列表高亮定位并启动诊断抽屉，完整演练两阶段验证、跳过Ping、患者确认与责任闭环。
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>内置场景矩阵 (全部包含真实模拟报文与审计证据)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEMO_SCENARIOS.map((sc) => (
              <div 
                key={sc.id}
                onClick={() => onSelectScenario(sc)}
                className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {sc.title}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${sc.badgeColor}`}>
                      {sc.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
                    {sc.coreRuleTested}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                      {sc.deviceId} / {sc.targetLineId}
                    </span>
                    <span>归属: <strong className="text-slate-700">{sc.responsibleRole}</strong></span>
                  </div>
                  <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    演练此案例
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            * 所有案例数据均为医院模拟仿真数据，不包含真实患者隐私；已内嵌完整的日志流与报文解析。
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
