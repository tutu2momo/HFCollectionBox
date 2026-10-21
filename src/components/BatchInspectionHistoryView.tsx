/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  Server, 
  Cpu, 
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import { BatchInspectionHistoryRecord, MedicalDevice, DeviceLine } from '../types';

interface BatchInspectionHistoryViewProps {
  historyRecords: BatchInspectionHistoryRecord[];
  devices: MedicalDevice[];
  onOpenDiagnosis: (device: MedicalDevice, line: DeviceLine) => void;
}

export const BatchInspectionHistoryView: React.FC<BatchInspectionHistoryViewProps> = ({
  historyRecords,
  devices,
  onOpenDiagnosis
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    historyRecords[0]?.id || ''
  );
  const [search, setSearch] = useState('');

  const selectedRecord = historyRecords.find(r => r.id === selectedRecordId) || historyRecords[0];

  // 全局聚合统计
  const totalRuns = historyRecords.length;
  const avgNormalRate = totalRuns > 0
    ? Math.round(historyRecords.reduce((acc, r) => acc + (r.normalCount / r.totalBoxes) * 100, 0) / totalRuns)
    : 0;
  const totalAnomaliesDiscovered = historyRecords.reduce((acc, r) => acc + r.abnormalCount, 0);

  const filteredRecords = historyRecords.filter(r => 
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.operator.toLowerCase().includes(search.toLowerCase()) ||
    r.scopeDept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 顶部总览卡片 */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>历史批量巡检记录台账 (正常与异常数据总结)</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono">
              共记录 {totalRuns} 次批次巡检
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            每次一键巡检均自动归档为独立历史快照，精确记录扫描时刻时序库中正常与各类异常盒子的数量及问题快照。
          </p>
        </div>

        {/* 核心指标统计 */}
        <div className="flex items-center gap-4 text-xs">
          <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <span className="text-slate-400 block text-[10px]">平均正常达标率</span>
            <span className="font-bold text-emerald-600 font-mono text-sm">{avgNormalRate}%</span>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <span className="text-slate-400 block text-[10px]">累计拦截异常盒次</span>
            <span className="font-bold text-amber-600 font-mono text-sm">{totalAnomaliesDiscovered} 盒次</span>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <span className="text-slate-400 block text-[10px]">平均巡检耗时</span>
            <span className="font-bold text-blue-600 font-mono text-sm">~120ms</span>
          </div>
        </div>
      </div>

      {/* 主工作区：左侧历史批次列表 + 右侧批次明细与异常快照 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左侧批次列表 */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col max-h-[720px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700">巡检执行批次清单</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索批次号/触发人..."
                className="pl-7 pr-2 py-1 text-xs border border-slate-300 rounded bg-white w-40 outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredRecords.map(record => {
              const isSelected = selectedRecord?.id === record.id;
              const normalRate = Math.round((record.normalCount / record.totalBoxes) * 100);

              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecordId(record.id)}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {record.id}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {record.inspectTime.split(' ')[1]}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mb-2">
                    <span>{record.operator}</span> · <span>耗时 {record.durationMs}ms</span>
                  </div>

                  {/* 正常 vs 异常 数据对比条 */}
                  <div className="bg-slate-100 p-2 rounded-md space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        正常盒子: <strong className="text-emerald-700">{record.normalCount}</strong> / {record.totalBoxes}
                      </span>
                      <span className="text-slate-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        异常盒子: <strong className="text-rose-700">{record.abnormalCount}</strong>
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full"
                        style={{ width: `${normalRate}%` }}
                      />
                      <div 
                        className="bg-rose-500 h-full"
                        style={{ width: `${100 - normalRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：当前批次正常与异常详细数据总结 */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 flex flex-col max-h-[720px] overflow-y-auto space-y-4">
          {selectedRecord ? (
            <>
              {/* 批次顶部头 */}
              <div className="pb-3 border-b border-slate-200 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 font-mono">
                      批次号 {selectedRecord.id} 巡检全貌
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                      范围: {selectedRecord.scopeCampus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>巡检时间: <strong className="font-mono text-slate-700">{selectedRecord.inspectTime}</strong></span>
                    <span>触发人员: <strong className="text-slate-700">{selectedRecord.operator}</strong></span>
                    <span>总耗时: <strong className="text-slate-700">{selectedRecord.durationMs}ms</strong></span>
                  </div>
                </div>
              </div>

              {/* 正常与异常数据总结卡片 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500 mb-0.5">巡检盒子总数</div>
                  <div className="text-lg font-bold text-slate-800 font-mono">{selectedRecord.totalBoxes} 台</div>
                  <div className="text-[10px] text-slate-400">覆盖 {selectedRecord.totalLines} 条线号</div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <div className="text-[11px] text-emerald-800 mb-0.5 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    正常采集盒子
                  </div>
                  <div className="text-lg font-bold text-emerald-700 font-mono">{selectedRecord.normalCount} 台</div>
                  <div className="text-[10px] text-emerald-600">近5m时序库持续入库</div>
                </div>

                <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
                  <div className="text-[11px] text-rose-800 mb-0.5 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    异常待诊断盒子
                  </div>
                  <div className="text-lg font-bold text-rose-700 font-mono">{selectedRecord.abnormalCount} 台</div>
                  <div className="text-[10px] text-rose-600">包含单线与全线无数据</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500 mb-0.5">数据库异常/超时</div>
                  <div className="text-lg font-bold text-slate-700 font-mono">{selectedRecord.queryErrorCount} 处</div>
                  <div className="text-[10px] text-slate-400">非设备故障，独立标明</div>
                </div>
              </div>

              {/* 异常采集设备与线号快照列表 */}
              <div>
                <div className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>本批次拦截到的异常采集盒与线号快照 (共 {selectedRecord.anomalousSnapshots.length} 处)</span>
                  <span className="text-[11px] text-slate-400 font-normal">点击可直接启动第二阶段单项诊断</span>
                </div>

                <div className="space-y-2">
                  {selectedRecord.anomalousSnapshots.map((item, idx) => {
                    const dev = devices.find(d => d.boxIp === item.boxIp || d.name.includes(item.deviceName));
                    const line = dev?.lines.find(l => l.lineId === item.lineId) || dev?.lines[0];

                    return (
                      <div 
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-400 transition flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            !
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-900 flex items-center gap-2">
                              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-xs bg-blue-100 text-blue-800 border border-blue-200">
                                {item.boxId || 'B01'}
                              </span>
                              <span>{item.room}</span>
                              <span>·</span>
                              <span>{item.deviceName}</span>
                              <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded text-[11px]">
                                线号 {item.lineId}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              采集盒 IP: {item.boxIp} · 现象: {item.issueSummary}
                            </div>
                          </div>
                        </div>

                        <div>
                          {dev && line ? (
                            <button
                              onClick={() => onOpenDiagnosis(dev, line)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-2xs"
                            >
                              <span>诊断此异常</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">历史静态快照</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {selectedRecord.anomalousSnapshots.length === 0 && (
                    <div className="p-8 text-center text-emerald-600 bg-emerald-50 rounded-lg text-xs font-medium">
                      ✓ 本批次巡检全部设备盒子采集均正常，未发现任何异常！
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
              请从左侧选择一条历史巡检批次查看数据总结
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
