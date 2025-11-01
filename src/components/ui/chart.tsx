"use client";

import * as React from "react";

interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartProps {
  data: Array<{
    [key: string]: string | number;
  }>;
  config: ChartConfig;
  type?: "bar" | "line" | "area";
}

export function Chart({ data, config, type = "bar" }: ChartProps) {
  const maxValue = Math.max(
    ...data.flatMap((item) =>
      Object.keys(config).map((key) => Number(item[key]) || 0)
    )
  );

  return (
    <div className="w-full space-y-4">
      <div className="relative h-[300px] w-full">
        <div className="absolute inset-0 flex flex-col justify-between">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between h-full pb-6">
            {[100, 75, 50, 25, 0].map((value) => (
              <div key={value} className="text-xs text-gray-500">
                {Math.round((maxValue * value) / 100).toLocaleString()}
              </div>
            ))}
          </div>
        </div>

        {/* Chart bars/lines */}
        <div className="relative ml-12 h-full flex items-end gap-2">
          {data.map((item, index) => {
            const values = Object.keys(config).map((key) => ({
              key,
              value: Number(item[key]) || 0,
              ...config[key],
            }));

            return (
              <div
                key={index}
                className="flex flex-col items-center gap-1 flex-1 h-full"
              >
                <div className="flex items-end gap-1 w-full h-full">
                  {values.map(({ key, value, color }) => (
                    <div
                      key={key}
                      className="w-full rounded-t"
                      style={{
                        height: `${(value / maxValue) * 100}%`,
                        backgroundColor: color,
                        minHeight: value > 0 ? "2px" : "0",
                      }}
                      title={`${config[key].label}: ${value.toLocaleString()}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-600 mt-2 truncate w-full text-center">
                  {item.label || item._id || index}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {Object.entries(config).map(([key, { label, color }]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


