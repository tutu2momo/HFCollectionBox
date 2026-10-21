/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCw, 
  Copy, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Clock, 
  Server, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Download, 
  UserCheck, 
  ShieldAlert, 
  FileText,
  CornerDownRight,
  User,
  ArrowRight
} from 'lucide-react';
import { 
  MedicalDevice, 
  DeviceLine, 
  DiagnosisStep, 
  DiagnosticLogItem, 
  DiagnosticRecord,
  ResponsibleRole 
} from '../types';
import { executeSingleLineDiagnosis } from '../services/diagnosticEngine';

interface DiagnosisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  device: MedicalDevice | null;
  targetLine: DeviceLine | null;
  allDevices: MedicalDevice[];
  onSaveRecord: (record: DiagnosticRecord) => void;
}

export const DiagnosisDrawer: React.FC<DiagnosisDrawerProps> = ({
  isOpen,
  onClose,
  device,
  targetLine,
  allDevices,
  onSaveRecord
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [patientChoice, setPatientChoice] = useState<'YES' | 'NO' | 'UNKNOWN' | null>(null);
  const [showPendingSteps, setShowPendingSteps] = useState(false);

  // 工单弹窗与处理弹窗
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketNote, setTicketNote] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  const [showHandleModal, setShowHandleModal] = useState(false);
  const [handleNote, setHandleNote] = useState('');
  const [handlerName, setHandlerName] = useState('现场工程师-张工');

  // 当选定设备或线号改变时，自动触发只读诊断
  useEffect(() => {
    if (isOpen && device && targetLine) {
      setPatientChoice(null);
      runDiagnosis();
    }
  }, [isOpen, device?.id, targetLine?.lineId]);

  const runDiagnosis = async (forcedPatientChoice?: 'YES' | 'NO' | 'UNKNOWN') => {
    if (!device || !targetLine) return;
    setIsRunning(true);
    setRecord(null);

    try {
      const result = await executeSingleLineDiagnosis({
        device,
        targetLine,
        allDevices,
        patientStatus: forcedPatientChoice || patientChoice || undefined,
        onStepUpdate: (steps, logs) => {
          // 增量实时反馈
        }
      });
      setRecord(result);
      onSaveRecord(result);
    } finally {
      setIsRunning(false);
    }
  };

  const handlePatientConfirm = (choice: 'YES' | 'NO' | 'UNKNOWN') => {
    setPatientChoice(choice);
    runDiagnosis(choice);
  };

  if (!isOpen || !device || !targetLine) return null;

  // 筛选日志
  const filteredLogs = (record?.logs || []).filter(log => {
    if (logFilter !== 'ALL' && log.level !== logFilter) return false;
    if (logSearch && !log.message.toLowerCase().includes(logSearch.toLowerCase()) && !log.source.toLowerCase().includes(logSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  // 复制诊断报告
  const handleCopyReport = () => {
    if (!record) return;
    const reportText = `【医疗物联网单项链路诊断报告】
设备: ${record.deviceName} (${record.deviceModel})
手术间: ${record.room}
采集盒IP: ${record.boxIp}
目标线号: ${record.targetLineId}
诊断时间: ${record.recordTime}
同盒其他线: ${record.coBoxLinesSummary}
诊断结论: ${record.conclusionTitle}
责任主体: ${getRoleName(record.responsibleRole)}
处置建议:
${record.actionAdvice.map((a, i) => `${i + 1}. ${a}`).join('\n')}

执行步骤概览:
${record.steps.map(s => `[${s.status}] 步骤${s.stepNumber} - ${s.title}: ${s.skipReason || s.evidenceSummary || '未执行'}`).join('\n')}
`;
    navigator.clipboard.writeText(reportText);
    alert('已复制结构化诊断报告到剪贴板！');
  };

  // 复制日志
  const handleCopyLogs = () => {
    if (!record) return;
    const logText = record.logs.map(l => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    alert('已复制原始控制台日志到剪贴板！');
  };

  // 下载日志
  const handleDownloadLogs = () => {
    if (!record) return;
    const logText = record.logs.map(l => `[${l.timestamp}] [${l.level}] [${l.source}] ${l.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diag_log_${record.deviceId}_${record.targetLineId}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 提交工单给网关工程师
  const handleSubmitTicket = () => {
    if (!record) return;
    record.handlingStatus = 'TRANSFERRED';
    record.transferredTo = `网关值班工程师 (${ticketPriority === 'URGENT' ? '加急' : '常规'})`;
    record.transferNote = ticketNote || '采集盒下行正常但未入库，已现场确认患者使用，请排查解析管道。';
    onSaveRecord({ ...record });
    setShowTicketModal(false);
    alert('已成功派发运维工单至网关工程师！');
  };

  // 现场标记已处理
  const handleMarkResolved = () => {
    if (!record) return;
    record.handlingStatus = 'RESOLVED';
    record.resolvedBy = handlerName;
    record.resolvedAt = new Date().toLocaleString();
    record.resolvedNote = handleNote || '现场已重新插紧下行转接线，报文接收恢复正常。';
    onSaveRecord({ ...record });
    setShowHandleModal(false);
    alert('已保存现场处置结果并归档入库！');
  };

  function getRoleName(role?: ResponsibleRole): string {
    switch (role) {
      case 'FIELD_ENGINEER': return '现场交付/运维人员';
      case 'GATEWAY_ENGINEER': return '网关/物联网后端工程师';
      case 'CLINICAL_STAFF': return '临床科室护士/技师';
      case 'SYSTEM_ADMIN': return '系统管理员';
      default: return '运维工程师';
    }
  }

  // 同盒其他线号列表
  const otherLinesOnSameBox = device.lines.filter(l => l.lineId !== targetLine.lineId);

  return (
    <>
      {/* 遮罩 */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 transition-opacity"
      />

      {/* 抽屉工作区 */}
      <aside className="fixed top-0 right-0 bottom-0 w-[680px] max-w-[95vw] bg-white z-50 shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* 顶部标题栏 */}
        <div className="h-16 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-base font-bold text-slate-900">
                单项链路深度诊断工作区
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                只读非侵入诊断
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {device.room} · {device.name} · 线号 [{targetLine.lineId}]
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 抽屉内容区 (四区) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ① 对象信息区 */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                诊断目标与拓扑信息
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {device.code}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400">设备名称/型号: </span>
                <span className="font-semibold text-slate-800">{device.name}</span>
              </div>
              <div>
                <span className="text-slate-400">所在手术间: </span>
                <span className="font-semibold text-slate-800">{device.room}</span>
              </div>
              <div>
                <span className="text-slate-400">采集盒编号 / IP: </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded font-mono font-bold text-xs bg-blue-100 text-blue-800 border border-blue-200">
                    {record?.boxId || (device.boxIp ? `B${device.boxIp.split('.').pop()?.slice(-2) || '01'}` : 'B01')}
                  </span>
                  <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-700 font-medium">
                    {device.boxIp || '未配置IP'}
                  </code>
                </div>
              </div>
              <div>
                <span className="text-slate-400">目标线号/端口: </span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {targetLine.lineId} (COM/Port {targetLine.port})
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-100 flex items-start gap-2">
                <span className="text-slate-400 shrink-0">同盒其他线号: </span>
                <div className="flex-1">
                  {otherLinesOnSameBox.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {otherLinesOnSameBox.map(ol => (
                        <span 
                          key={ol.lineId}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            ol.dataCount5Min > 0 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${ol.dataCount5Min > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {ol.lineId} ({ol.lineName}): 近5分入库 {ol.dataCount5Min} 点
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">单线设备（同盒无其他线号）</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ② 诊断步骤时间轴区 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                诊断链路执行步骤 (顺序只读核验)
              </span>
              <span className="text-[11px] text-slate-500">
                失败后续标记“未执行”，同盒在线跳过Ping
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden divide-y divide-slate-100">
              {isRunning && !record && (
                <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                  <RotateCw className="w-6 h-6 animate-spin text-blue-600" />
                  <span>正在严格按两阶段规则执行诊断...</span>
                </div>
              )}

              {/* 流程走到哪里展示哪里：展示已经执行或已判定的步骤 */}
              {record?.steps.filter(s => s.status !== 'PENDING').map((step) => {
                const isExpanded = expandedStepId === step.id;
                return (
                  <div key={step.id} className="p-3 hover:bg-slate-50/80 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* 状态指示徽章 */}
                        <div className="mt-0.5 shrink-0">
                          {step.status === 'SUCCESS' && (
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                              ✓
                            </span>
                          )}
                          {step.status === 'FAILED' && (
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                              ✕
                            </span>
                          )}
                          {step.status === 'SKIPPED' && (
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs" title="已跳过">
                              ↷
                            </span>
                          )}
                          {step.status === 'RUNNING' && (
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              步骤 {step.stepNumber}：{step.title}
                            </span>
                            {step.status === 'SKIPPED' && (
                              <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-medium border border-purple-200">
                                豁免跳过 (具备同盒在线证据)
                              </span>
                            )}
                            {step.durationMs !== undefined && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {step.durationMs}ms
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {step.description}
                          </p>

                          {/* 摘要证据 */}
                          {(step.evidenceSummary || step.skipReason) && (
                            <div className={`mt-2 p-2 rounded text-xs leading-relaxed border ${
                              step.status === 'SKIPPED' 
                                ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                                : step.status === 'FAILED'
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}>
                              <span className="font-semibold">证据摘要：</span>
                              {step.skipReason || step.evidenceSummary}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 展开详细报文折叠按钮 */}
                      {step.evidenceDetails && (
                        <button
                          onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 shrink-0 mt-1 cursor-pointer"
                        >
                          <span>{isExpanded ? '收起证据' : '原始报文'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* 展开的原始底层证据 */}
                    {isExpanded && step.evidenceDetails && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 bg-slate-950 text-slate-200 p-2.5 rounded font-mono text-[11px] space-y-1">
                        <div className="text-slate-400 text-[10px] uppercase font-sans font-semibold">底核执行快照证据</div>
                        {step.evidenceDetails.logSnippet?.map((snip, idx) => (
                          <div key={idx} className="text-slate-300">$ {snip}</div>
                        ))}
                        {step.evidenceDetails.metrics && (
                          <div className="text-emerald-400">
                            METRICS: {JSON.stringify(step.evidenceDetails.metrics)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 剩下的未进行的步骤收起来，支持点击展开 */}
              {record && record.steps.filter(s => s.status === 'PENDING').length > 0 && (
                <div className="bg-slate-50/80 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowPendingSteps(!showPendingSteps)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        后续未执行步骤 ({record.steps.filter(s => s.status === 'PENDING').length} 项)
                      </span>
                      <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        因前序步骤判定已中断或无需执行，默认收起
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      {showPendingSteps ? '收起待执行步骤' : '点开查看剩余步骤'}
                      {showPendingSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  {showPendingSteps && (
                    <div className="divide-y divide-slate-100 border-t border-slate-200 bg-white">
                      {record.steps.filter(s => s.status === 'PENDING').map((step) => (
                        <div key={step.id} className="p-3 bg-slate-50/40 opacity-70 hover:opacity-100 transition">
                          <div className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                              {step.stepNumber}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-700">
                                  步骤 {step.stepNumber}：{step.title}
                                </span>
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                  未执行
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 关键业务交互提示框：attach OK, recv > 0, 近5分无数据时核实患者使用 */}
          {record && record.targetLineId && targetLine.dataCount5Min === 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold">
                  ?
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                    <span>关键判定节点：当前设备是否有患者使用？</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                      产品规则必须项
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    当前采集盒下行口已收到物理报文 (recv &gt; 0)，但近 5 分钟数据库无体征入库点。依据产品设计规则，不能草率定性设备故障，必须由现场确认临床实际使用状态：
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <button
                      onClick={() => handlePatientConfirm('YES')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${
                        patientChoice === 'YES'
                          ? 'bg-rose-600 text-white'
                          : 'bg-white text-rose-700 border border-rose-300 hover:bg-rose-50'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>① 有患者在使用 (定性为网关解析/写库异常)</span>
                    </button>

                    <button
                      onClick={() => handlePatientConfirm('NO')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${
                        patientChoice === 'NO'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>② 无患者使用 (定性为闲置符合规则预期)</span>
                    </button>

                    <button
                      onClick={() => handlePatientConfirm('UNKNOWN')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                        patientChoice === 'UNKNOWN'
                          ? 'bg-slate-700 text-white'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>③ 暂无法确认 (需人工现场判读)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ③ 诊断结论与处理建议区 */}
          {record && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  诊断定性与闭环建议
                </span>
                <span className="text-[11px] text-slate-500">
                  责任归属: <strong className="text-blue-700">{getRoleName(record.responsibleRole)}</strong>
                </span>
              </div>

              {/* 核心结论卡片 */}
              <div className={`p-3.5 rounded-md border flex items-start gap-3 mb-3.5 ${
                record.severity === 'CRITICAL'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : record.severity === 'WARNING'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : record.severity === 'INFO'
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="mt-0.5">
                  {record.severity === 'CRITICAL' && <AlertCircle className="w-5 h-5 text-rose-600" />}
                  {record.severity === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {record.severity === 'INFO' && <Info className="w-5 h-5 text-blue-600" />}
                  {record.severity === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {record.conclusionTitle}
                  </div>
                  <div className="text-xs mt-1 leading-relaxed opacity-90">
                    同盒共存状态：{record.coBoxLinesSummary}
                  </div>
                </div>
              </div>

              {/* 处理建议清单 */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  标准处置与协同闭环步骤：
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {record.actionAdvice.map((advice, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 若已转交或已处理，显示状态 */}
              {record.handlingStatus !== 'UNHANDLED' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">工单状态:</span>
                    <span className="px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                      {record.handlingStatus === 'TRANSFERRED' ? '已转交网关处理' : '已现场处置完成'}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    {record.transferredTo && `受理人: ${record.transferredTo}`}
                    {record.resolvedBy && `处置人: ${record.resolvedBy}`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ④ 原始控制台日志区 */}
          <div className="bg-slate-900 rounded-lg p-4 text-slate-200 font-mono text-xs shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans font-semibold text-white">
                  💻 诊断底层会话日志
                </span>
                <span className="text-[10px] text-slate-400">
                  ({filteredLogs.length} 条记录)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 搜索 */}
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="过滤报文/关键字..."
                    className="bg-slate-800 text-slate-200 pl-7 pr-2 py-1 text-[11px] rounded border border-slate-700 outline-none w-32 focus:w-44 transition-all"
                  />
                </div>

                {/* 级别筛选 */}
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value as any)}
                  className="bg-slate-800 text-slate-200 px-2 py-1 text-[11px] rounded border border-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">全部级别</option>
                  <option value="INFO">INFO</option>
                  <option value="WARN">WARN</option>
                  <option value="ERROR">ERROR</option>
                </select>

                <button
                  onClick={handleCopyLogs}
                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  title="复制日志"
                >
                  复制
                </button>
                <button
                  onClick={handleDownloadLogs}
                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
                  title="下载日志"
                >
                  下载
                </button>
              </div>
            </div>

            {/* 日志内容滚动流 */}
            <div className="max-h-56 overflow-y-auto space-y-1 text-[11px] leading-relaxed pr-1">
              {filteredLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                    log.level === 'ERROR' 
                      ? 'bg-rose-900/60 text-rose-300' 
                      : log.level === 'WARN'
                        ? 'bg-amber-900/60 text-amber-300'
                        : 'bg-blue-900/60 text-blue-300'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-slate-400 shrink-0">[{log.source}]</span>
                  <span className="text-slate-200 break-all">{log.message}</span>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-slate-500 italic py-2">暂无符合条件的日志</div>
              )}
            </div>
          </div>
        </div>

        {/* 底部固定操作栏 */}
        <div className="h-16 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 shadow-lg z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => runDiagnosis()}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>重新诊断</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>复制诊断报告</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTicketModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-rose-600" />
              <span>转交网关工程师</span>
            </button>

            <button
              onClick={() => setShowHandleModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>标记已处理</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 转交网关工单弹窗 */}
      {showTicketModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-rose-600" />
                转交网关/物联网后端工程师
              </span>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">优先级</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="prio" 
                      checked={ticketPriority === 'NORMAL'} 
                      onChange={() => setTicketPriority('NORMAL')} 
                    />
                    <span>常规排查</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-rose-600 font-semibold">
                    <input 
                      type="radio" 
                      name="prio" 
                      checked={ticketPriority === 'URGENT'} 
                      onChange={() => setTicketPriority('URGENT')} 
                    />
                    <span>紧急故障 (手术中)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">故障说明与工单留言</label>
                <textarea
                  rows={3}
                  value={ticketNote}
                  onChange={(e) => setTicketNote(e.target.value)}
                  placeholder="如：采集盒下行报文接收正常，但近5分钟无入库数据，已现场证实患者在使用，请排查解析管道。"
                  className="w-full p-2 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowTicketModal(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-600 border border-slate-300 hover:bg-slate-100"
              >
                取消
              </button>
              <button 
                onClick={handleSubmitTicket}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
              >
                确认派发
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 现场处理完成弹窗 */}
      {showHandleModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                记录现场排查处理结果
              </span>
              <button onClick={() => setShowHandleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">处置工程师姓名</label>
                <input
                  type="text"
                  value={handlerName}
                  onChange={(e) => setHandlerName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">现场排查施措说明</label>
                <textarea
                  rows={3}
                  value={handleNote}
                  onChange={(e) => setHandleNote(e.target.value)}
                  placeholder="如：已前往3号手术室吊塔，发现串口转接线脱开，重新插紧后指示灯恢复常亮，数据流恢复正常。"
                  className="w-full p-2 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowHandleModal(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-600 border border-slate-300 hover:bg-slate-100"
              >
                取消
              </button>
              <button 
                onClick={handleMarkResolved}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
              >
                确认归档
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
