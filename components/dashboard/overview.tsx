"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  {
    name: "Mon",
    completed: 4,
    inProgress: 2,
    pending: 1,
  },
  {
    name: "Tue",
    completed: 3,
    inProgress: 4,
    pending: 2,
  },
  {
    name: "Wed",
    completed: 5,
    inProgress: 3,
    pending: 0,
  },
  {
    name: "Thu",
    completed: 6,
    inProgress: 2,
    pending: 1,
  },
  {
    name: "Fri",
    completed: 2,
    inProgress: 5,
    pending: 3,
  },
  {
    name: "Sat",
    completed: 1,
    inProgress: 1,
    pending: 0,
  },
  {
    name: "Sun",
    completed: 0,
    inProgress: 0,
    pending: 0,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" name="Completed" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="inProgress" name="In Progress" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="pending" name="Pending" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}