/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Search, CheckCircle2, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { MOCK_MODEL_RULES } from '../mock/seedData';
import { DeviceModelRule } from '../types';

export const ModelRulesView: React.FC = () => {
  const [search, setSearch] = useState('');
  const rules = MOCK_MODEL_RULES.filter(r => 
    r.model.toLowerCase().includes(search.toLowerCase()) ||
    r.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 顶部说明卡片 */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>医疗设备型号规则知识库</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono">
              设备出厂特性与闲置报文特征
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            诊断中 attach OK 且 recv &gt; 0 时，系统严格比对此处定义的型号规则与现场患者状态，避免未经证实就误报设备故障。
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索型号/厂商/类别..."
            className="pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs w-60 outline-none"
          />
        </div>
      </div>

      {/* 规则卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {rules.map((rule) => (
          <div 
            key={rule.id}
            className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col justify-between hover:border-blue-400 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {rule.model}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    {rule.manufacturer} · {rule.category}
                  </div>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded">
                  预期线号: {rule.expectedLineCount}
                </span>
              </div>

              {/* 特性比对表格 */}
              <div className="bg-slate-50 rounded p-2.5 space-y-1.5 text-xs my-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">无患者时下行是否有recv:</span>
                  <span className={`font-semibold text-[11px] px-1.5 py-0.2 rounded ${
                    rule.hasRecvWithoutPatient 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {rule.hasRecvWithoutPatient ? '有 (发心跳/脱落包)' : '无 (串口完全静默)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">无患者时是否允许入库:</span>
                  <span className={`font-semibold text-[11px] px-1.5 py-0.2 rounded ${
                    rule.allowNoDataStorage 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {rule.allowNoDataStorage ? '允许入库空包' : '过滤不入库 (符合预期)'}
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-600">
                  <span className="text-slate-400">标准通信协议: </span>
                  <code className="text-blue-700 font-mono">{rule.typicalProtocol}</code>
                </div>
              </div>

              {/* 闲置报文特征说明 */}
              <div>
                <div className="text-[11px] font-semibold text-slate-700 mb-1">
                  空载/闲置报文机制分析：
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-2 rounded border border-slate-100">
                  {rule.idlePacketDescription}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>知识库标识: {rule.id}</span>
              <span className="text-blue-600 hover:underline cursor-pointer">查看接入规范</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
