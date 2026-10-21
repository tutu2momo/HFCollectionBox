/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  Cpu, 
  Radio, 
  Server, 
  MapPin, 
  Zap, 
  Grid, 
  List, 
  ExternalLink, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  SlidersHorizontal,
  Activity,
  Layers
} from 'lucide-react';
import { AcquisitionBox, MedicalDevice, DeviceLine, BoxInspectionStatus } from '../types';

interface InspectionOverviewProps {
  boxes: AcquisitionBox[];
  devices: MedicalDevice[];
  onOpenBoxDetail: (box: AcquisitionBox) => void;
  onOpenDiagnosis: (device: MedicalDevice, line: DeviceLine) => void;
  onRunBatchInspection: () => void;
  isInspecting: boolean;
  inspectProgress: number;
  lastInspectTime: string;
  hasRunInspection: boolean;
  selectedCampus: string;
  onSelectCampus?: (campus: string) => void;
}

export const InspectionOverview: React.FC<InspectionOverviewProps> = ({
  boxes,
  devices,
  onOpenBoxDetail,
  onOpenDiagnosis,
  onRunBatchInspection,
  isInspecting,
  inspectProgress,
  lastInspectTime,
  hasRunInspection,
  selectedCampus,
  onSelectCampus
}) => {
  const [viewMode, setViewMode] = useState<'CARD' | 'LIST'>('CARD');
  const [localCampus, setLocalCampus] = useState(selectedCampus);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [boxModelFilter, setBoxModelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 同步外部院区选择
  React.useEffect(() => {
    setLocalCampus(selectedCampus);
  }, [selectedCampus]);

  const activeCampus = onSelectCampus ? selectedCampus : localCampus;

  const handleCampusChange = (c: string) => {
    setLocalCampus(c);
    if (onSelectCampus) {
      onSelectCampus(c);
    }
  };

  // 筛选盒子
  const filteredBoxes = boxes.filter(box => {
    if (activeCampus !== 'ALL' && box.campus !== activeCampus) return false;
    if (departmentFilter !== 'ALL' && box.department !== departmentFilter) return false;
    if (boxModelFilter !== 'ALL' && box.model !== boxModelFilter) return false;
    
    // 如果已巡检，用 currentStatus 判断；未巡检用 status
    const currentBoxStatus = hasRunInspection && box.currentStatus ? box.currentStatus : box.status;
    if (statusFilter !== 'ALL' && currentBoxStatus !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = box.name.toLowerCase().includes(q);
      const matchIp = box.ip.includes(q);
      const matchLocation = box.physicalLocation.toLowerCase().includes(q);
      const matchModel = box.model.toLowerCase().includes(q);
      const matchRoom = box.room.toLowerCase().includes(q);
      if (!matchName && !matchIp && !matchLocation && !matchModel && !matchRoom) return false;
    }
    return true;
  });

  // 各状态采集总和计算
  const totalBoxes = filteredBoxes.length;
  const normalBoxes = filteredBoxes.filter(b => (hasRunInspection && b.currentStatus ? b.currentStatus : b.status) === 'NORMAL').length;
  const partialBoxes = filteredBoxes.filter(b => (hasRunInspection && b.currentStatus ? b.currentStatus : b.status) === 'PARTIAL_NO_DATA').length;
  const allNoDataBoxes = filteredBoxes.filter(b => (hasRunInspection && b.currentStatus ? b.currentStatus : b.status) === 'ALL_NO_DATA').length;
  const queryErrBoxes = filteredBoxes.filter(b => (hasRunInspection && b.currentStatus ? b.currentStatus : b.status) === 'QUERY_ERROR').length;
  const offlineBoxes = filteredBoxes.filter(b => (hasRunInspection && b.currentStatus ? b.currentStatus : b.status) === 'OFFLINE').length;
  const abnormalBoxes = partialBoxes + allNoDataBoxes + queryErrBoxes + offlineBoxes;
  const normalRate = totalBoxes > 0 ? Math.round((normalBoxes / totalBoxes) * 100) : 0;

  // 获取状态徽章
  const getBoxStatusBadge = (status: BoxInspectionStatus, isCurrentResult = false) => {
    const prefix = isCurrentResult ? '本次: ' : '上次: ';
    switch (status) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {prefix}采集正常
          </span>
        );
      case 'PARTIAL_NO_DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            {prefix}部分线无数据
          </span>
        );
      case 'ALL_NO_DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            {prefix}无数据待诊断
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-200 text-rose-900">
            <ShieldAlert className="w-3 h-3 text-rose-700" />
            {prefix}采集盒离线
          </span>
        );
      case 'QUERY_ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-800">
            <HelpCircle className="w-3 h-3 text-slate-600" />
            {prefix}查询异常
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
            尚未巡检
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 巡检中执行进度横幅 */}
      {isInspecting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-1.5">
            <span className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-blue-600" />
              第一阶段批量巡检中：并发查询全部采集盒连接线号近 5 分钟时序数据库入库量 (不执行Ping/诊断)...
            </span>
            <span className="font-mono text-blue-700">{inspectProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-200 ease-out"
              style={{ width: `${inspectProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 巡检完成后的结果展示横幅与采集总和 */}
      {hasRunInspection && (
        <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-sm animate-in slide-in-from-top-2 duration-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                本次一键巡检已执行完毕 · 各状态采集总和已就绪
              </span>
              <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-medium">
                耗时 124ms
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              巡检完成时间: <strong className="text-slate-800">{lastInspectTime}</strong>
            </div>
          </div>

          {/* 各个状态采集总和指标卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 pt-1">
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">巡检盒子总数</div>
              <div className="text-lg font-bold text-slate-900 font-mono">{totalBoxes} 台</div>
              <div className="text-[10px] text-slate-400">覆盖全院区</div>
            </div>

            <div className="bg-emerald-50 p-2.5 rounded-md border border-emerald-200">
              <div className="text-[10px] text-emerald-800 font-medium">采集正常盒子</div>
              <div className="text-lg font-bold text-emerald-700 font-mono">{normalBoxes} 台</div>
              <div className="text-[10px] text-emerald-600">正常率 {normalRate}%</div>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-md border border-amber-200">
              <div className="text-[10px] text-amber-800 font-medium">部分线无数据</div>
              <div className="text-lg font-bold text-amber-700 font-mono">{partialBoxes} 台</div>
              <div className="text-[10px] text-amber-700">同盒跳过Ping</div>
            </div>

            <div className="bg-rose-50 p-2.5 rounded-md border border-rose-200">
              <div className="text-[10px] text-rose-800 font-medium">全部无数据待诊断</div>
              <div className="text-lg font-bold text-rose-700 font-mono">{allNoDataBoxes} 台</div>
              <div className="text-[10px] text-rose-600">需开启单项诊断</div>
            </div>

            <div className="bg-rose-100/60 p-2.5 rounded-md border border-rose-300">
              <div className="text-[10px] text-rose-900 font-medium">采集盒离线/掉电</div>
              <div className="text-lg font-bold text-rose-800 font-mono">{offlineBoxes} 台</div>
              <div className="text-[10px] text-rose-700">Ping失败脱网</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="text-[10px] text-slate-500">时序库查询异常</div>
              <div className="text-lg font-bold text-slate-700 font-mono">{queryErrBoxes} 台</div>
              <div className="text-[10px] text-slate-500">非设备故障</div>
            </div>
          </div>
        </div>
      )}

      {/* 巡检前总览指示条 (若尚未点击巡检) */}
      {!hasRunInspection && (
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                <span>采集设备盒子主视图 (巡检前状态)</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  共挂接 {boxes.length} 台采集盒 · 19 条线号
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                当前显示各采集盒<strong>上次巡检状态、IP地址、版本型号与连接设备数</strong>。点击右上角“一键批量巡检”即可拉取近5分钟最新入库指标与总和！
              </p>
            </div>
          </div>

          <button
            onClick={onRunBatchInspection}
            disabled={isInspecting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin' : ''}`} />
            <span>执行一键批量巡检 (近5m DB)</span>
          </button>
        </div>
      )}

      {/* 筛选与视图模式切换栏 */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        {/* 第一行：院区、科室、采集设备型号核心筛选条件 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* 1. 院区筛选 */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                院区:
              </span>
              <select
                value={activeCampus}
                onChange={(e) => handleCampusChange(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium text-xs outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">全部院区</option>
                <option value="总院区">总院区</option>
                <option value="东院区">东院区</option>
              </select>
            </div>

            {/* 2. 科室筛选 */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                科室/手术部:
              </span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium text-xs outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">全部科室/手术部</option>
                <option value="第一手术部">第一手术部 (数字化手术室)</option>
                <option value="第二手术部">第二手术部 (专科急诊)</option>
                <option value="麻醉复苏部PACU">麻醉复苏部 (PACU)</option>
                <option value="重症医学科ICU">重症医学科 (ICU)</option>
              </select>
            </div>

            {/* 3. 采集设备型号筛选 */}
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                采集盒型号:
              </span>
              <select
                value={boxModelFilter}
                onChange={(e) => setBoxModelFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white font-medium text-xs outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">全部型号</option>
                <option value="MedGate-Pro 400">MedGate-Pro 400 (旗舰4串口+双网)</option>
                <option value="MedGate-Standard 300">MedGate-Standard 300 (标准双串口)</option>
                <option value="MedGate-Lite 200">MedGate-Lite 200 (单串口紧凑型)</option>
              </select>
            </div>

            {/* 重置筛选 */}
            {(activeCampus !== 'ALL' || departmentFilter !== 'ALL' || boxModelFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  handleCampusChange('ALL');
                  setDepartmentFilter('ALL');
                  setBoxModelFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline px-1 cursor-pointer font-medium"
              >
                重置全部筛选
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            当前筛选显示: <strong className="text-blue-700">{filteredBoxes.length}</strong> / {boxes.length} 台采集盒
          </div>
        </div>

        {/* 第二行：状态快捷筛选、搜索与卡片/列表模式切换 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 状态筛选 */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部状态 ({boxes.length})
            </button>
            <button
              onClick={() => setStatusFilter('NORMAL')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                statusFilter === 'NORMAL' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              采集正常
            </button>
            <button
              onClick={() => setStatusFilter('PARTIAL_NO_DATA')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                statusFilter === 'PARTIAL_NO_DATA' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              部分线无数据
            </button>
            <button
              onClick={() => setStatusFilter('ALL_NO_DATA')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                statusFilter === 'ALL_NO_DATA' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              无数据待诊断
            </button>
            <button
              onClick={() => setStatusFilter('OFFLINE')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                statusFilter === 'OFFLINE' ? 'bg-rose-700 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              盒子离线
            </button>
          </div>

          {/* 搜索与卡片/列表模式切换 */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索采集盒名称/IP/位置/型号..."
                className="pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs w-56 outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
              <button
                onClick={() => setViewMode('CARD')}
                className={`p-1.5 rounded transition cursor-pointer ${viewMode === 'CARD' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                title="卡片展示视图"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded transition cursor-pointer ${viewMode === 'LIST' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                title="表格列表视图"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主视图展示：卡片视图 (Card Mode) */}
      {viewMode === 'CARD' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredBoxes.map(box => {
            const currentStatus = hasRunInspection && box.currentStatus ? box.currentStatus : box.status;
            const boundDevices = devices.filter(d => box.connectedDeviceIds.includes(d.id) || d.boxIp === box.ip);
            const isAbnormal = currentStatus !== 'NORMAL';
            
            // 找到该盒子绑定的异常设备和线号用于触发单项诊断
            const abnormalDevice = boundDevices.find(d => d.lines.some(l => l.status === 'NO_DATA_PENDING')) || boundDevices[0];
            const abnormalLine = abnormalDevice?.lines.find(l => l.status === 'NO_DATA_PENDING') || abnormalDevice?.lines[0];

            return (
              <div 
                key={box.id}
                className={`bg-white rounded-lg border p-4 shadow-2xs flex flex-col justify-between transition hover:shadow-md ${
                  currentStatus === 'ALL_NO_DATA' || currentStatus === 'OFFLINE'
                    ? 'border-rose-300 bg-rose-50/15'
                    : currentStatus === 'PARTIAL_NO_DATA'
                      ? 'border-amber-300 bg-amber-50/15'
                      : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div>
                  {/* 顶部：地点与状态 */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[11px] bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                          {box.id}
                        </span>
                        <Server className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="truncate text-xs font-semibold text-slate-800">{box.name}</span>
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[220px]" title={box.physicalLocation}>
                          {box.physicalLocation}
                        </span>
                      </div>
                    </div>

                    {getBoxStatusBadge(currentStatus, hasRunInspection)}
                  </div>

                  {/* 核心属性参数条 */}
                  <div className="bg-slate-50 rounded-md p-2.5 text-xs space-y-1.5 my-2.5 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">IP 地址:</span>
                      <code className="font-mono font-semibold text-blue-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {box.ip || '未配置'}
                      </code>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">版本型号:</span>
                      <span className="font-medium text-slate-700">{box.model}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">固件版本:</span>
                      <span className="font-mono text-slate-600 text-[11px]">{box.firmware}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">连接设备数:</span>
                      <span className="font-semibold text-slate-800">
                        连接 {boundDevices.length} 台医疗仪器 ({box.connectedLineIds.length} 条线)
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">上次巡检时间:</span>
                      <span className="font-mono text-slate-600">{box.lastInspectionTime.split(' ')[1]}</span>
                    </div>
                  </div>

                  {/* 挂载设备简述 */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium">挂接设备与线号：</div>
                    <div className="flex flex-wrap gap-1.5">
                      {boundDevices.map(d => (
                        <span key={d.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          <Cpu className="w-3 h-3 text-slate-500" />
                          {d.name.split(' ')[0]} ({d.lines.map(l => l.lineId).join('/')})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 底部操作区 */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenBoxDetail(box)}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium transition cursor-pointer"
                  >
                    <span>查看详情</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  {/* 异常处置与诊断入口 */}
                  {isAbnormal && abnormalDevice && abnormalLine ? (
                    <button
                      onClick={() => onOpenDiagnosis(abnormalDevice, abnormalLine)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition cursor-pointer"
                      title="打开单项诊断抽屉查看处置建议"
                    >
                      <span>诊断与处理建议</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-medium text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      运行正常
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 列表模式展示：表格视图 (List Mode) */}
      {viewMode === 'LIST' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-3">采集盒名称 / 编号</th>
                  <th className="py-3 px-3">物理安装地点</th>
                  <th className="py-3 px-3">IP 地址</th>
                  <th className="py-3 px-3">版本型号 / 固件</th>
                  <th className="py-3 px-3">连接设备台数</th>
                  <th className="py-3 px-3">挂载线号</th>
                  <th className="py-3 px-3">巡检状态</th>
                  <th className="py-3 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBoxes.map(box => {
                  const currentStatus = hasRunInspection && box.currentStatus ? box.currentStatus : box.status;
                  const boundDevices = devices.filter(d => box.connectedDeviceIds.includes(d.id) || d.boxIp === box.ip);
                  const isAbnormal = currentStatus !== 'NORMAL';
                  const abnormalDevice = boundDevices.find(d => d.lines.some(l => l.status === 'NO_DATA_PENDING')) || boundDevices[0];
                  const abnormalLine = abnormalDevice?.lines.find(l => l.status === 'NO_DATA_PENDING') || abnormalDevice?.lines[0];

                  return (
                    <tr key={box.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded font-mono font-bold text-xs bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                            {box.id}
                          </span>
                          <span className="font-semibold text-slate-900">{box.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-700">
                        <div>{box.room}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]" title={box.physicalLocation}>
                          {box.physicalLocation}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                          {box.ip || '未配置'}
                        </code>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{box.model}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{box.firmware}</div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800 font-mono">
                        {boundDevices.length} 台
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {box.connectedLineIds.map(lineId => (
                            <span key={lineId} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                              {lineId}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {getBoxStatusBadge(currentStatus, hasRunInspection)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenBoxDetail(box)}
                            className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          >
                            查看详情
                          </button>

                          {isAbnormal && abnormalDevice && abnormalLine ? (
                            <button
                              onClick={() => onOpenDiagnosis(abnormalDevice, abnormalLine)}
                              className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition cursor-pointer"
                            >
                              诊断与建议
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-medium text-[11px]">正常</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
