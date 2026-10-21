/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  Server, 
  Cpu, 
  Radio, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  ShieldAlert, 
  ExternalLink,
  Wifi,
  Zap,
  Activity
} from 'lucide-react';
import { AcquisitionBox, MedicalDevice, DeviceLine } from '../types';

interface BoxDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  box: AcquisitionBox | null;
  devices: MedicalDevice[];
  onStartDiagnosis?: (device: MedicalDevice, line: DeviceLine) => void;
}

export const BoxDetailModal: React.FC<BoxDetailModalProps> = ({
  isOpen,
  onClose,
  box,
  devices,
  onStartDiagnosis
}) => {
  if (!isOpen || !box) return null;

  // 关联的医疗设备
  const boundDevices = devices.filter(d => box.connectedDeviceIds.includes(d.id) || d.boxIp === box.ip);

  // 汇集该盒子所有的线号信息
  const allLines: { device: MedicalDevice; line: DeviceLine }[] = [];
  boundDevices.forEach(d => {
    d.lines.forEach(l => {
      allLines.push({ device: d, line: l });
    });
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            采集正常
          </span>
        );
      case 'PARTIAL_NO_DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            部分线无数据
          </span>
        );
      case 'ALL_NO_DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            全部无数据待诊断
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-200 text-rose-900">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
            采集盒离线
          </span>
        );
      case 'QUERY_ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            数据库查询异常
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            尚未巡检
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-100 text-blue-800 border border-blue-200">
                  {box.id}
                </span>
                <h3 className="text-sm font-semibold text-slate-800">{box.name}</h3>
                {getStatusBadge(box.currentStatus || box.status)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                采集盒硬件台账 · 物理位置与下行线号全景详情
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs bg-slate-50/40">
          {/* 基础参数网格 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              采集盒硬件与网络配置
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4">
              <div>
                <span className="text-slate-400 block text-[11px]">盒子编号:</span>
                <span className="font-semibold text-slate-800 font-mono">{box.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">IP 地址:</span>
                <code className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                  {box.ip || '未配置'}
                </code>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">MAC 地址:</span>
                <span className="font-mono text-slate-700 font-medium">{box.mac}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">版本型号:</span>
                <span className="font-semibold text-slate-800">{box.model}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">固件版本:</span>
                <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{box.firmware}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">供电状态:</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${
                  box.powerStatus === 'AC_ONLINE' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  <Zap className="w-3 h-3" />
                  {box.powerStatus === 'AC_ONLINE' ? '市电正常 (220V AC)' : '掉电离线'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">物理安装地点:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {box.physicalLocation}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">上行网口状态:</span>
                <span className="font-mono text-slate-700">{box.uplinkPort}</span>
              </div>
            </div>
          </div>

          {/* 挂载的医疗设备 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-100 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                挂载的医疗设备 (共 {boundDevices.length} 台)
              </span>
              <span className="text-slate-400 text-[11px] font-normal">
                {box.room}
              </span>
            </div>

            <div className="space-y-2">
              {boundDevices.map(d => (
                <div key={d.id} className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {d.category.substring(0, 1)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {d.name} ({d.model})
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        资产编号: {d.code} · 厂商: {d.manufacturer}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-500">
                      挂载 {d.lines.length} 条下行线
                    </div>
                    <div className="text-[10px] text-blue-600 font-mono font-medium">
                      {d.lines.map(l => l.lineId).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 连接的线号与实时采集数据情况 */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="font-bold text-xs text-slate-800 pb-2 border-b border-slate-100 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                下行物理通道与线号入库指标 (共 {allLines.length} 条线)
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                近5分钟DB写入指标
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <th className="py-2 px-3">线号</th>
                    <th className="py-2 px-3">通道名称 / 所属设备</th>
                    <th className="py-2 px-3">物理端口 / 协议</th>
                    <th className="py-2 px-3">近5分数据点</th>
                    <th className="py-2 px-3">最后入库时间</th>
                    <th className="py-2 px-3">状态</th>
                    <th className="py-2 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allLines.map(({ device, line }) => (
                    <tr key={line.lineId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                        {line.lineId}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{line.lineName}</div>
                        <div className="text-[11px] text-slate-400">{device.name}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div>Port {line.port}</div>
                        <div className="text-slate-400">{line.protocol}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        {line.dataCount5Min > 0 ? (
                          <span className="text-emerald-600">{line.dataCount5Min} 点</span>
                        ) : line.dataCount5Min === 0 ? (
                          <span className="text-amber-600">0 点</span>
                        ) : (
                          <span className="text-rose-600">查询超时</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                        {line.lastDataTime || '无数据记录'}
                      </td>
                      <td className="py-2.5 px-3">
                        {line.status === 'NORMAL' ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            正常
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                            待诊断
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {line.status !== 'NORMAL' && onStartDiagnosis ? (
                          <button
                            onClick={() => {
                              onClose();
                              onStartDiagnosis(device, line);
                            }}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition"
                          >
                            单项诊断
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">正常无需诊断</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 采集盒历史巡检小结 */}
          <div className="bg-slate-100 p-3 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-200">
            <span className="font-semibold text-slate-800">上次巡检时间：</span>
            <span className="font-mono text-slate-700 mr-3">{box.lastInspectionTime}</span>
            <span className="font-semibold text-slate-800">巡检备注：</span>
            <span>{box.notes || '常规状态核验通过'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            * 采集盒为数据汇聚中枢；通过专用线缆连接仪器，经由上行网络上报网关。
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            关闭详情
          </button>
        </div>
      </div>
    </div>
  );
};
