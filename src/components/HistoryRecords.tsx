/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  User, 
  Send, 
  ArrowRight,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Server,
  Cpu,
  MapPin,
  Edit3,
  X,
  ShieldAlert,
  Zap,
  RotateCw,
  Copy,
  Layers
} from 'lucide-react';
import { AcquisitionBox, MedicalDevice, DeviceLine, DiagnosticRecord } from '../types';

interface HistoryRecordsProps {
  boxes: AcquisitionBox[];
  records: DiagnosticRecord[];
  devices: MedicalDevice[];
  onOpenDiagnosis?: (device: MedicalDevice, line: DeviceLine) => void;
  onUpdateRecord?: (updatedRecord: DiagnosticRecord) => void;
  onViewRecord?: (record: DiagnosticRecord) => void;
}

export const HistoryRecords: React.FC<HistoryRecordsProps> = ({
  boxes,
  records,
  devices,
  onOpenDiagnosis,
  onUpdateRecord,
  onViewRecord
}) => {
  // 筛选条件：院区、科室、采集设备型号、处置状态、搜索
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [boxModelFilter, setBoxModelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyShowWithRecords, setOnlyShowWithRecords] = useState(false);

  // 选中的采集盒子 (以采集盒子为主)
  const [selectedBoxId, setSelectedBoxId] = useState<string>(boxes[0]?.id || 'B01');

  // 折叠步骤展开状态
  const [expandedRecordSteps, setExpandedRecordSteps] = useState<{ [recordId: string]: boolean }>({});
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // 处置编辑弹窗状态
  const [editingRecord, setEditingRecord] = useState<DiagnosticRecord | null>(null);
  const [editStatus, setEditStatus] = useState<DiagnosticRecord['handlingStatus']>('RESOLVED');
  const [editHandler, setEditHandler] = useState('现场工程师-张峰');
  const [editNote, setEditNote] = useState('');
  const [editTransferredTo, setEditTransferredTo] = useState('网关值班工程师');

  // 获取盒子关联的诊断记录
  const getRecordsForBox = (box: AcquisitionBox): DiagnosticRecord[] => {
    return records.filter(r => {
      // 匹配 boxId 或 boxIp
      if (r.boxId && r.boxId === box.id) return true;
      if (r.boxIp && r.boxIp === box.ip) return true;
      // 匹配绑定的设备 ID
      if (box.connectedDeviceIds && box.connectedDeviceIds.includes(r.deviceId)) return true;
      return false;
    });
  };

  // 筛选盒子列表
  const filteredBoxes = boxes.filter(box => {
    if (campusFilter !== 'ALL' && box.campus !== campusFilter) return false;
    if (departmentFilter !== 'ALL' && box.department !== departmentFilter) return false;
    if (boxModelFilter !== 'ALL' && box.model !== boxModelFilter) return false;

    const boxRecs = getRecordsForBox(box);

    if (onlyShowWithRecords && boxRecs.length === 0) return false;

    if (statusFilter !== 'ALL') {
      const hasMatchingStatus = boxRecs.some(r => r.handlingStatus === statusFilter);
      if (!hasMatchingStatus) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = box.id.toLowerCase().includes(q);
      const matchName = box.name.toLowerCase().includes(q);
      const matchIp = box.ip.includes(q);
      const matchLoc = box.physicalLocation.toLowerCase().includes(q);
      const matchRoom = box.room.toLowerCase().includes(q);
      const matchRec = boxRecs.some(r => 
        r.conclusionTitle.toLowerCase().includes(q) || 
        r.deviceName.toLowerCase().includes(q) ||
        r.targetLineId.toLowerCase().includes(q)
      );
      if (!matchId && !matchName && !matchIp && !matchLoc && !matchRoom && !matchRec) return false;
    }

    return true;
  });

  // 当前选中的盒子
  const currentBox = boxes.find(b => b.id === selectedBoxId) || filteredBoxes[0] || boxes[0];
  const currentBoxRecords = currentBox ? getRecordsForBox(currentBox) : [];

  // 打开编辑处置结果弹窗
  const handleOpenEditModal = (rec: DiagnosticRecord) => {
    setEditingRecord(rec);
    setEditStatus(rec.handlingStatus || 'RESOLVED');
    setEditHandler(rec.resolvedBy || '现场工程师-张工');
    setEditNote(rec.resolvedNote || rec.transferNote || '');
    setEditTransferredTo(rec.transferredTo || '网关值班工程师');
  };

  // 保存处置结果
  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const updated: DiagnosticRecord = {
      ...editingRecord,
      handlingStatus: editStatus,
      resolvedBy: editStatus === 'RESOLVED' || editStatus === 'VERIFIED' ? editHandler : undefined,
      resolvedAt: editStatus === 'RESOLVED' || editStatus === 'VERIFIED' ? new Date().toLocaleString() : undefined,
      resolvedNote: editStatus === 'RESOLVED' || editStatus === 'VERIFIED' ? editNote : undefined,
      transferredTo: editStatus === 'TRANSFERRED' ? editTransferredTo : undefined,
      transferNote: editStatus === 'TRANSFERRED' ? editNote : undefined
    };

    if (onUpdateRecord) {
      onUpdateRecord(updated);
    }
    setEditingRecord(null);
  };

  // 复制诊断结构化结论
  const handleCopyDiagnosis = (rec: DiagnosticRecord) => {
    const text = `【诊断记录凭证】\n记录编号: ${rec.id}\n时间: ${rec.recordTime}\n采集盒子: [${rec.boxId || currentBox?.id}] ${currentBox?.name || ''} (${rec.boxIp})\n设备通道: ${rec.deviceName} [${rec.targetLineId}]\n诊断结论: ${rec.conclusionTitle} (${rec.severity})\n责任归属: ${rec.responsibleRole}\n处置状态: ${rec.handlingStatus}\n处置说明: ${rec.resolvedNote || rec.transferNote || '无'}`;
    navigator.clipboard.writeText(text);
    alert('已复制该次诊断与处理记录凭证到剪贴板！');
  };

  // 状态徽章辅助函数
  const getHandlingBadge = (status: DiagnosticRecord['handlingStatus']) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            现场已解决
          </span>
        );
      case 'TRANSFERRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Send className="w-3 h-3 text-blue-600" />
            已转交网关
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-slate-600" />
            已复核归档
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            待现场处置
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 顶部标题与说明栏 */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div>
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>诊断与处理记录 (以采集盒子为主)</span>
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full font-mono border border-blue-200">
                硬件盒实体主线 · 历次闭环审计
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              以采集设备盒子为主维度展示历次单项诊断结论、自动报文证据链及人工运维处置结果；重诊独立新增记录，保留全链路追溯。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              当前收录: <strong className="text-slate-800 font-mono">{boxes.length}</strong> 台采集盒 · <strong className="text-blue-700 font-mono">{records.length}</strong> 次诊断记录
            </span>
          </div>
        </div>

        {/* 筛选条件行：院区、科室、采集设备型号、处置状态、搜索 */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* 院区 */}
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-slate-400">院区:</span>
              <select
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium outline-none text-xs focus:border-blue-500"
              >
                <option value="ALL">全部院区</option>
                <option value="总院区">总院区</option>
                <option value="东院区">东院区</option>
              </select>
            </div>

            {/* 科室 */}
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-slate-400">科室/手术部:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium outline-none text-xs focus:border-blue-500"
              >
                <option value="ALL">全部科室</option>
                <option value="第一手术部">第一手术部</option>
                <option value="第二手术部">第二手术部</option>
                <option value="麻醉复苏部PACU">麻醉复苏部PACU</option>
                <option value="重症医学科ICU">重症医学科ICU</option>
              </select>
            </div>

            {/* 采集设备型号 */}
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-slate-400">采集盒型号:</span>
              <select
                value={boxModelFilter}
                onChange={(e) => setBoxModelFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium outline-none text-xs focus:border-blue-500"
              >
                <option value="ALL">全部型号</option>
                <option value="MedGate-Pro 400">MedGate-Pro 400 (旗舰4串口+双网)</option>
                <option value="MedGate-Standard 300">MedGate-Standard 300 (标准双串口)</option>
                <option value="MedGate-Lite 200">MedGate-Lite 200 (单串口紧凑型)</option>
              </select>
            </div>

            {/* 处置状态 */}
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-slate-400">处置状态:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium outline-none text-xs focus:border-blue-500"
              >
                <option value="ALL">全部状态</option>
                <option value="UNHANDLED">待处理工单</option>
                <option value="TRANSFERRED">已转交网关</option>
                <option value="RESOLVED">现场已解决</option>
                <option value="VERIFIED">已复核归档</option>
              </select>
            </div>

            {/* 切换仅看有记录 */}
            <button
              onClick={() => setOnlyShowWithRecords(!onlyShowWithRecords)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition cursor-pointer ${
                onlyShowWithRecords 
                  ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              仅显示有诊断记录盒子
            </button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索盒子编号(如B01)/名称/IP/位置/设备..."
              className="pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs w-64 outline-none focus:border-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 主布局：左侧以采集盒子为主的列表，右侧展示选定盒子的历次诊断记录与结果 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧：采集盒子列表 (以采集设备盒子为主) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[740px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span>采集设备盒子列表</span>
              <span className="text-[11px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                {filteredBoxes.length} 台
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">点击选择盒子查看历次诊断</span>
          </div>

          {filteredBoxes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center flex-1">
              <Server className="w-8 h-8 text-slate-300 mb-2" />
              <span>当前筛选条件下未找到匹配的采集盒</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
              {filteredBoxes.map(box => {
                const isSelected = currentBox?.id === box.id;
                const boxRecs = getRecordsForBox(box);
                const hasAbnormal = boxRecs.some(r => r.handlingStatus === 'UNHANDLED' || r.handlingStatus === 'TRANSFERRED');
                const latestRec = boxRecs[0];

                return (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBoxId(box.id)}
                    className={`p-3.5 cursor-pointer transition ${
                      isSelected 
                        ? 'bg-blue-50/80 border-l-4 border-blue-600 shadow-2xs' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {/* 简短采集盒子编号 */}
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-xs border ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {box.id}
                        </span>
                        <span className="font-medium text-xs text-slate-800 truncate max-w-[170px]">
                          {box.name}
                        </span>
                      </div>

                      {/* 诊断记录数量 */}
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-medium ${
                        boxRecs.length > 0 
                          ? hasAbnormal 
                            ? 'bg-rose-100 text-rose-800 font-bold' 
                            : 'bg-slate-100 text-slate-700'
                          : 'bg-slate-50 text-slate-400'
                      }`}>
                        {boxRecs.length > 0 ? `${boxRecs.length} 次诊断` : '无诊断记录'}
                      </span>
                    </div>

                    {/* 盒子参数及位置 */}
                    <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-500 mt-2">
                      <div className="flex items-center gap-1 font-mono text-slate-600">
                        <span className="text-slate-400">IP:</span>
                        <code>{box.ip}</code>
                      </div>
                      <div className="text-right truncate text-slate-600">
                        {box.model}
                      </div>
                      <div className="col-span-2 flex items-center gap-1 text-slate-400 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{box.physicalLocation}</span>
                      </div>
                    </div>

                    {/* 最新诊断结论简述 (若有) */}
                    {latestRec && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 truncate max-w-[210px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                          最新: {latestRec.conclusionTitle}
                        </span>
                        {getHandlingBadge(latestRec.handlingStatus)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 右侧：展示选定采集盒子的历次诊断记录和结果 */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[740px]">
          {/* 选定盒子顶部全景概览条 */}
          {currentBox ? (
            <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-sm bg-blue-600 text-white shadow-2xs">
                    {currentBox.id}
                  </span>
                  <h3 className="font-semibold text-xs text-slate-800">
                    {currentBox.name}
                  </h3>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {currentBox.model}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {currentBox.ip}
                  </code>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{currentBox.physicalLocation}</span>
                </div>
                <div className="font-medium text-slate-700">
                  共计收录 <strong className="text-blue-700 font-mono font-bold">{currentBoxRecords.length}</strong> 次诊断与处理记录
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              请先在左侧选择采集盒
            </div>
          )}

          {/* 历次诊断记录与结果列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
            {currentBoxRecords.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">该采集盒子运转良好，暂无异常单项诊断记录</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    采集盒各项下行物理链路与时序入库平稳。若需要对该采集盒连接的医疗设备进行例行单线健康核验，可点击下方发起单项诊断。
                  </p>
                </div>

                {/* 挂载设备快速诊断发起入口 */}
                <div className="pt-3 flex flex-wrap justify-center gap-2">
                  {devices
                    .filter(d => currentBox?.connectedDeviceIds.includes(d.id) || d.boxIp === currentBox?.ip)
                    .map(dev => (
                      <button
                        key={dev.id}
                        onClick={() => {
                          if (onOpenDiagnosis && dev.lines[0]) {
                            onOpenDiagnosis(dev, dev.lines[0]);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition cursor-pointer"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>单项诊断: {dev.name.split(' ')[0]} ({dev.lines[0]?.lineId})</span>
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              currentBoxRecords.map((rec, index) => {
                const isStepExpanded = expandedRecordSteps[rec.id];
                const targetDev = devices.find(d => d.id === rec.deviceId);
                const targetLine = targetDev?.lines.find(l => l.lineId === rec.targetLineId);

                // 拆分执行步骤和未执行步骤
                const executedSteps = rec.steps.filter(s => s.status !== 'PENDING');
                const pendingSteps = rec.steps.filter(s => s.status === 'PENDING');

                return (
                  <div 
                    key={rec.id}
                    className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden transition hover:border-slate-300"
                  >
                    {/* 诊断记录 Header */}
                    <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {rec.recordTime}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({rec.id})
                        </span>
                        <span className="text-xs bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-slate-500" />
                          {rec.deviceName} · [{rec.targetLineId}]
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getHandlingBadge(rec.handlingStatus)}
                        <button
                          onClick={() => handleCopyDiagnosis(rec)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                          title="复制结构化诊断凭证"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3.5 text-xs">
                      {/* 自动诊断结论卡片 */}
                      <div className={`p-3 rounded-lg border ${
                        rec.severity === 'SUCCESS' 
                          ? 'bg-emerald-50/70 border-emerald-200' 
                          : rec.severity === 'CRITICAL'
                            ? 'bg-rose-50/80 border-rose-200'
                            : 'bg-amber-50/70 border-amber-200'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            {rec.severity === 'SUCCESS' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            ) : rec.severity === 'CRITICAL' ? (
                              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <h4 className="font-bold text-xs text-slate-900">
                                {rec.conclusionTitle}
                              </h4>
                              {rec.coBoxLinesSummary && (
                                <p className="text-[11px] text-slate-600 mt-0.5">
                                  <strong>同盒证据链：</strong>{rec.coBoxLinesSummary}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                            {rec.responsibleRole === 'FIELD_ENGINEER' ? '现场交付人员' : rec.responsibleRole === 'GATEWAY_ENGINEER' ? '网关工程师' : '系统自动'}
                          </span>
                        </div>

                        {/* 处理建议清单 */}
                        {rec.actionAdvice && rec.actionAdvice.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                            <span className="text-[11px] font-semibold text-slate-700">自动处置建议：</span>
                            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 mt-1">
                              {rec.actionAdvice.map((adv, idx) => (
                                <li key={idx}>{adv}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* 诊断链路步骤走查 (流程走到哪里展示哪里，未执行的可以收起点开) */}
                      <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-50/40">
                        <div className="p-2.5 bg-slate-100/80 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            诊断链路执行痕迹 (已核验 {executedSteps.length} 步 / 剩余 {pendingSteps.length} 步)
                          </span>
                          <span className="text-slate-400 font-normal">
                            同盒在线跳过Ping · 失败后续未执行
                          </span>
                        </div>

                        {/* 已执行步骤列表 */}
                        <div className="divide-y divide-slate-100 bg-white">
                          {executedSteps.map(step => (
                            <div key={step.id} className="p-2.5 flex items-start gap-2.5 text-xs">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                                step.status === 'SUCCESS' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : step.status === 'SKIPPED'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-rose-100 text-rose-700'
                              }`}>
                                {step.status === 'SUCCESS' ? '✓' : step.status === 'SKIPPED' ? '↷' : '✕'}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-800 text-[11px]">
                                    步骤 {step.stepNumber}: {step.title}
                                  </span>
                                  {step.status === 'SKIPPED' && (
                                    <span className="text-[10px] bg-purple-50 text-purple-700 px-1 py-0.2 rounded border border-purple-200">
                                      豁免跳过Ping
                                    </span>
                                  )}
                                  {step.durationMs !== undefined && (
                                    <span className="font-mono text-[10px] text-slate-400">
                                      {step.durationMs}ms
                                    </span>
                                  )}
                                </div>
                                {(step.evidenceSummary || step.skipReason) && (
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {step.skipReason || step.evidenceSummary}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 剩余未执行步骤 (收起来，可支持点开) */}
                        {pendingSteps.length > 0 && (
                          <div className="border-t border-slate-200 bg-slate-50">
                            <button
                              onClick={() => {
                                setExpandedRecordSteps(prev => ({
                                  ...prev,
                                  [rec.id]: !prev[rec.id]
                                }));
                              }}
                              className="w-full px-3 py-2 flex items-center justify-between text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 font-medium">
                                <Clock className="w-3 h-3 text-slate-400" />
                                后续未执行步骤 ({pendingSteps.length} 项) · 默认收起
                              </span>
                              <span className="text-blue-600 font-semibold flex items-center gap-1">
                                {isStepExpanded ? '收起未执行步骤' : '点开查看剩余步骤'}
                                {isStepExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </span>
                            </button>

                            {isStepExpanded && (
                              <div className="divide-y divide-slate-100 border-t border-slate-200 bg-white">
                                {pendingSteps.map(step => (
                                  <div key={step.id} className="p-2.5 flex items-start gap-2.5 text-xs opacity-60">
                                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                                      {step.stepNumber}
                                    </span>
                                    <div>
                                      <span className="font-medium text-slate-700 text-[11px]">
                                        步骤 {step.stepNumber}: {step.title} (未执行)
                                      </span>
                                      <p className="text-[10px] text-slate-400">{step.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 人工处理与闭环记录结果区块 */}
                      <div className="bg-slate-50 rounded-md p-3 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-600" />
                            现场运维处置与流转记录
                          </span>
                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>更新处理结果</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-400">处置责任人: </span>
                            <span className="font-semibold text-slate-700">
                              {rec.resolvedBy || rec.transferredTo || '待指派现场工程师'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">处置时间: </span>
                            <span className="font-mono text-slate-700">
                              {rec.resolvedAt || rec.recordTime}
                            </span>
                          </div>
                          <div className="col-span-2 bg-white p-2 rounded border border-slate-200 text-slate-700">
                            <span className="text-slate-400 block text-[10px]">处理结论 / 沟通流转记录：</span>
                            <span className="mt-0.5 block leading-relaxed">
                              {rec.resolvedNote || rec.transferNote || '尚未填写现场处理说明，请点击右上角更新。'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 底部按钮栏 */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-400">
                          会话审计: {rec.logs?.length || 0} 条诊断原始报文日志
                        </div>

                        <div className="flex items-center gap-2">
                          {targetDev && targetLine && onOpenDiagnosis && (
                            <button
                              onClick={() => onOpenDiagnosis(targetDev, targetLine)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition cursor-pointer"
                            >
                              <RotateCw className="w-3 h-3" />
                              <span>再次诊断该通道</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 更新处理结果工单弹窗 */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>更新诊断处理结果与运维闭环记录</span>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="p-5 space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">当前诊断记录对象:</span>
                <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                  [{currentBox?.id}] {editingRecord.deviceName} · 通道 {editingRecord.targetLineId}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">处置状态流转:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs outline-none focus:border-blue-500"
                >
                  <option value="RESOLVED">现场已解决 (重新接驳线缆/恢复通讯)</option>
                  <option value="TRANSFERRED">已转交网关工程师 (入库阻塞/解析故障)</option>
                  <option value="VERIFIED">已复核归档 (定期例行无异常)</option>
                  <option value="UNHANDLED">待现场处置 (排队待检)</option>
                </select>
              </div>

              {editStatus === 'TRANSFERRED' ? (
                <div>
                  <label className="block text-slate-700 font-medium mb-1">转交目标人/组:</label>
                  <input
                    type="text"
                    value={editTransferredTo}
                    onChange={(e) => setEditTransferredTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs outline-none"
                    placeholder="如：网关值班工程师、物联网运维二组"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-medium mb-1">现场处理人姓名:</label>
                  <input
                    type="text"
                    value={editHandler}
                    onChange={(e) => setEditHandler(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs outline-none"
                    placeholder="如：现场工程师-张峰"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-medium mb-1">处理结果详细说明 / 处置方案:</label>
                <textarea
                  rows={3}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="如：已重新插紧2号手术室麻醉深度模块卡扣，重启串口接收，体征流已恢复入库..."
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  保存处理结果并归档
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
