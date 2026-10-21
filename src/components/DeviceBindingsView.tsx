/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  Server, 
  Radio, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Save, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { MedicalDevice, DeviceLine } from '../types';

interface DeviceBindingsViewProps {
  devices: MedicalDevice[];
  onUpdateDevices: (newDevices: MedicalDevice[]) => void;
  onOpenDiagnosis: (device: MedicalDevice, line: DeviceLine) => void;
}

export const DeviceBindingsView: React.FC<DeviceBindingsViewProps> = ({
  devices,
  onUpdateDevices,
  onOpenDiagnosis
}) => {
  const [search, setSearch] = useState('');
  const [editingDevice, setEditingDevice] = useState<MedicalDevice | null>(null);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState<{
    id: string;
    code: string;
    name: string;
    category: 'MONITOR' | 'ANESTHESIA' | 'VENTILATOR' | 'DEFIBRILLATOR' | 'INFUSION';
    model: string;
    manufacturer: string;
    campus: string;
    department: string;
    room: string;
    boxIp: string;
    boxMac: string;
    lines: {
      lineId: string;
      lineName: string;
      port: number;
      protocol: string;
      dataCount5Min: number;
    }[];
  }>({
    id: '',
    code: '',
    name: '',
    category: 'MONITOR',
    model: '',
    manufacturer: '',
    campus: '总院区',
    department: '第一手术部',
    room: '手术间 01 (心胸数字化)',
    boxIp: '',
    boxMac: '',
    lines: []
  });

  const filtered = devices.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.room.toLowerCase().includes(search.toLowerCase()) ||
    d.boxIp.includes(search) ||
    d.code.toLowerCase().includes(search.toLowerCase()) ||
    d.lines.some(l => l.lineId.toLowerCase().includes(search.toLowerCase()))
  );

  // 打开新增表单
  const handleAddNew = () => {
    setIsNewDevice(true);
    setEditingDevice(null);
    setFormData({
      id: `DEV-${Date.now()}`,
      code: `DEV-2026-OR${Math.floor(Math.random() * 10 + 1)}-01`,
      name: '',
      category: 'MONITOR',
      model: '',
      manufacturer: '迈瑞医疗 (Mindray)',
      campus: '总院区',
      department: '第一手术部',
      room: '手术间 01 (心胸数字化)',
      boxIp: '192.168.10.101',
      boxMac: '00:1A:C2:7B:82:11',
      lines: [
        {
          lineId: 'L01',
          lineName: '生理体征主通道',
          port: 8001,
          protocol: 'Mindray-eGateway',
          dataCount5Min: 1200
        }
      ]
    });
    setIsModalOpen(true);
  };

  // 打开编辑表单
  const handleEdit = (device: MedicalDevice) => {
    setIsNewDevice(false);
    setEditingDevice(device);
    setFormData({
      id: device.id,
      code: device.code,
      name: device.name,
      category: device.category,
      model: device.model,
      manufacturer: device.manufacturer,
      campus: device.campus,
      department: device.department,
      room: device.room,
      boxIp: device.boxIp,
      boxMac: device.boxMac || '',
      lines: device.lines.map(l => ({
        lineId: l.lineId,
        lineName: l.lineName,
        port: l.port,
        protocol: l.protocol,
        dataCount5Min: l.dataCount5Min
      }))
    });
    setIsModalOpen(true);
  };

  // 删除设备
  const handleDelete = (deviceId: string) => {
    if (confirm('确定要解除此设备与采集盒、线号的所有绑定关系吗？')) {
      const updated = devices.filter(d => d.id !== deviceId);
      onUpdateDevices(updated);
    }
  };

  // 表单添加线号
  const handleAddLineToForm = () => {
    const nextNum = formData.lines.length + 1;
    const nextLineId = `L0${nextNum}`;
    setFormData(prev => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          lineId: nextLineId,
          lineName: `新增采集通道 ${nextLineId}`,
          port: 8000 + nextNum,
          protocol: 'Mindray-eGateway',
          dataCount5Min: 0
        }
      ]
    }));
  };

  // 表单删除线号
  const handleRemoveLineFromForm = (idx: number) => {
    if (formData.lines.length <= 1) {
      alert('每个设备至少保留一条下行线号！');
      return;
    }
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx)
    }));
  };

  // 保存表单
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入医疗设备名称！');
      return;
    }

    const newDeviceObj: MedicalDevice = {
      id: formData.id,
      code: formData.code,
      name: formData.name,
      category: formData.category,
      model: formData.model || formData.name,
      manufacturer: formData.manufacturer,
      campus: formData.campus,
      department: formData.department,
      room: formData.room,
      boxIp: formData.boxIp,
      boxMac: formData.boxMac,
      aggregateStatus: formData.boxIp ? 'NORMAL' : 'BINDING_INCOMPLETE',
      lines: formData.lines.map(l => ({
        lineId: l.lineId,
        lineName: l.lineName,
        boxIp: formData.boxIp,
        port: Number(l.port) || 8001,
        status: formData.boxIp ? 'NORMAL' : 'CONFIG_INCOMPLETE',
        dataCount5Min: l.dataCount5Min >= 0 ? l.dataCount5Min : 1200,
        lastDataTime: new Date().toLocaleString(),
        protocol: l.protocol
      }))
    };

    if (isNewDevice) {
      onUpdateDevices([newDeviceObj, ...devices]);
    } else {
      onUpdateDevices(devices.map(d => d.id === formData.id ? newDeviceObj : d));
    }

    setIsModalOpen(false);
    alert('设备与线号映射绑定已保存并生效！');
  };

  return (
    <div className="space-y-4">
      {/* 顶部工具栏 */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>医疗设备 — 采集盒 — 下行线号映射台账 (表单管理)</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
              共 {devices.length} 台设备映射
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            通过结构化表单配置设备、采集盒 IP 与多条下行线号映射；支持在线新增、编辑绑定、动态增删通道端口。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索设备/手术间/IP/线号..."
              className="pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs w-56 outline-none"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增设备绑定</span>
          </button>
        </div>
      </div>

      {/* 结构化映射表格 */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3">手术间 / 物理位置</th>
                <th className="py-3 px-3">医疗设备信息</th>
                <th className="py-3 px-3">关联采集盒 IP / MAC</th>
                <th className="py-3 px-3">下行绑定的线号及端口</th>
                <th className="py-3 px-3">协议驱动</th>
                <th className="py-3 px-3">绑定状态</th>
                <th className="py-3 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(dev => (
                <tr key={dev.id} className="hover:bg-slate-50 transition">
                  {/* 手术间 */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{dev.room}</div>
                    <div className="text-[11px] text-slate-400">{dev.department}</div>
                  </td>

                  {/* 医疗设备 */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{dev.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-normal">
                        {dev.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {dev.code} · {dev.manufacturer}
                    </div>
                  </td>

                  {/* 采集盒 */}
                  <td className="py-3 px-3">
                    {dev.boxIp ? (
                      <div>
                        <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                          {dev.boxIp}
                        </code>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          MAC: {dev.boxMac || '00:1A:C2:...'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-rose-600 font-medium text-[11px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        未绑定采集盒IP
                      </span>
                    )}
                  </td>

                  {/* 绑定的线号及端口 */}
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      {dev.lines.map(l => (
                        <div key={l.lineId} className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded text-[11px] border border-blue-200">
                            {l.lineId}
                          </span>
                          <span className="text-slate-800">{l.lineName}</span>
                          <span className="text-slate-400 font-mono text-[11px]">(Port {l.port})</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* 协议驱动 */}
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                    {dev.lines.map(l => (
                      <div key={l.lineId}>{l.protocol}</div>
                    ))}
                  </td>

                  {/* 状态 */}
                  <td className="py-3 px-3">
                    {dev.boxIp ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        映射正常
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        绑定缺失
                      </span>
                    )}
                  </td>

                  {/* 操作 */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(dev)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>编辑绑定</span>
                      </button>

                      <button
                        onClick={() => handleDelete(dev.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="解除绑定关系"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 设备与线号映射编辑 / 新增 表单弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <h3 className="font-bold text-sm text-slate-900">
                  {isNewDevice ? '新增设备与线号映射绑定' : `编辑设备绑定：${formData.name}`}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* 设备基本参数 */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  医疗设备信息
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">设备名称 *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="如：多参数监护仪 BeneVision N17"
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">型号规格 *</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="如：BeneVision N17"
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">设备类型</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white outline-none"
                    >
                      <option value="MONITOR">病人监护仪</option>
                      <option value="ANESTHESIA">麻醉工作站</option>
                      <option value="VENTILATOR">重症呼吸机</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">制造厂商</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="如：迈瑞医疗 (Mindray)"
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">物理地点 (手术间)</label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                      placeholder="如：手术间 01 (心胸数字化)"
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">资产编号</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="DEV-2026-OR01-01"
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 关联采集盒 */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <div className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  采集设备盒子网络绑定
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">采集盒 IP 地址 *</label>
                    <input
                      type="text"
                      value={formData.boxIp}
                      onChange={(e) => setFormData({ ...formData, boxIp: e.target.value })}
                      placeholder="如：192.168.10.101"
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">采集盒 MAC 地址</label>
                    <input
                      type="text"
                      value={formData.boxMac}
                      onChange={(e) => setFormData({ ...formData, boxMac: e.target.value })}
                      placeholder="如：00:1A:C2:7B:82:11"
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 下行线号动态配置表单 */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-600" />
                    下行线号与通道映射 (多线设备独立判断)
                  </div>

                  <button
                    type="button"
                    onClick={handleAddLineToForm}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    <span>添加线号</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.lines.map((line, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-md border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono border border-blue-200">
                          通道 #{idx + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveLineFromForm(idx)}
                          className="text-slate-400 hover:text-rose-600"
                          title="删除此线号"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-slate-500 text-[11px] mb-0.5">线号ID *</label>
                          <input
                            type="text"
                            required
                            value={line.lineId}
                            onChange={(e) => {
                              const newLines = [...formData.lines];
                              newLines[idx].lineId = e.target.value;
                              setFormData({ ...formData, lines: newLines });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-0.5">通道名称</label>
                          <input
                            type="text"
                            value={line.lineName}
                            onChange={(e) => {
                              const newLines = [...formData.lines];
                              newLines[idx].lineName = e.target.value;
                              setFormData({ ...formData, lines: newLines });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-0.5">端口 (COM/Port)</label>
                          <input
                            type="number"
                            value={line.port}
                            onChange={(e) => {
                              const newLines = [...formData.lines];
                              newLines[idx].port = Number(e.target.value);
                              setFormData({ ...formData, lines: newLines });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 text-[11px] mb-0.5">通讯协议</label>
                          <select
                            value={line.protocol}
                            onChange={(e) => {
                              const newLines = [...formData.lines];
                              newLines[idx].protocol = e.target.value;
                              setFormData({ ...formData, lines: newLines });
                            }}
                            className="w-full p-1.5 border border-slate-300 rounded text-xs bg-white"
                          >
                            <option value="Mindray-eGateway">Mindray-eGateway</option>
                            <option value="Philips Data Export">Philips Data Export</option>
                            <option value="Dräger Medibus II">Dräger Medibus II</option>
                            <option value="Maquet-SCI">Maquet-SCI</option>
                            <option value="Hamilton DCI">Hamilton DCI</option>
                            <option value="GE Datex Record">GE Datex Record</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 提交与取消 */}
              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-md text-xs text-slate-600 border border-slate-300 hover:bg-slate-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>保存配置</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
