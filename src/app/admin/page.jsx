"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import Button from "@components/button/Button";
import styles from "./admin.module.css";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
);

export default function Admin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [userCounts, setUserCounts] = useState(null);
  const [syncCounts, setSyncCounts] = useState(null);
  const [syncDailyCounts, setSyncDailyCounts] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // gate: login + admin only
  useEffect(() => {
    if (
      status === "unauthenticated" ||
      (status === "authenticated" && session?.user?.role !== "admin")
    ) {
      router.push("/");
    }
  }, [status, session, router]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [uRes, sRes] = await Promise.all([
        fetch("/api/admin/user-metrics", { cache: "no-store" }),
        fetch("/api/admin/sync-metrics", { cache: "no-store" }),
      ]);
      if (!uRes.ok) throw new Error(`user-metrics ${uRes.status}`);
      if (!sRes.ok) throw new Error(`sync-metrics ${sRes.status}`);

      setUserCounts(await uRes.json());
      const { totalCount, dailyCounts } = await sRes.json();
      setSyncCounts(Number(totalCount) || 0);
      setSyncDailyCounts(dailyCounts || []);
    } catch (e) {
      setError(e?.message || "load failed");
    } finally {
      setLoading(false);
    }
  }

  // useEffect(() => {
  //   if (status === "authenticated" && session?.user?.role === "admin") load();
  // }, [status, session]);

  const usersChart = useMemo(() => {
    const labels = (userCounts ?? []).map((d) => d.createdAt);
    const counts = (userCounts ?? []).map((d) => d.count ?? 0);

    return {
      data: {
        labels,
        datasets: [
          {
            label: "New users per day",
            data: counts,
            fill: true,
            borderColor: "rgba(99, 102, 241, 1)", // indigo-500
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, "rgba(99, 102, 241, 0.3)"); // top
              gradient.addColorStop(1, "rgba(99, 102, 241, 0)"); // bottom
              return gradient;
            },
            pointBackgroundColor: "#6366F1",
            borderWidth: 2,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1E1E1E",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 10,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: { color: "#555", precision: 0 },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#777", autoSkip: true, maxTicksLimit: 14 },
          },
        },
      },
    };
  }, [userCounts]);

  const syncDailyCountsChart = useMemo(() => {
    const labels = (syncDailyCounts ?? []).map((d) => d.date);
    const counts = (syncDailyCounts ?? []).map((d) => d.count ?? 0);

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Sync operations per day",
            data: counts,
            fill: true,
            borderColor: "rgba(99, 102, 241, 1)", // indigo-500
            backgroundColor: (context) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, "rgba(99, 102, 241, 0.3)"); // top
              gradient.addColorStop(1, "rgba(99, 102, 241, 0)"); // bottom
              return gradient;
            },
            pointBackgroundColor: "#6366F1",
            borderWidth: 2,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1E1E1E",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 10,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: { color: "#555", precision: 0 },
          },
          x: {
            grid: { display: false },
            ticks: { color: "#777", autoSkip: true, maxTicksLimit: 14 },
          },
        },
      },
    };
  }, [syncDailyCounts]);

  if (
    status === "loading" ||
    (status === "authenticated" && session?.user?.role !== "admin")
  ) {
    return <div>Loading…</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.actions}>
        <Button
          text={loading ? "Refreshing…" : "Refresh"}
          onClick={load}
          disabled={loading}
        />
      </div>

      {error && (
        <div className={styles.section}>
          <div className={styles.card}>Error: {error}</div>
        </div>
      )}

      <div className={styles.grid}>
        <section className={`${styles.section} ${styles.card}`}>
          <h2>Total Sync Count (last 7 days)</h2>
          <div className={styles.syncNumber}>
            {syncCounts !== null ? syncCounts : "—"}
          </div>
          <div className={styles.syncLabel}>
            Total sync operations in the last 7 days (168 hours)
          </div>
        </section>
        <section className={`${styles.section} ${styles.card}`}>
          <h2>Sync Count (last 7 days)</h2>
          <div className={styles.chartWrap}>
            {syncDailyCounts ? (
              <Line
                data={syncDailyCountsChart.data}
                options={syncDailyCountsChart.options}
              />
            ) : (
              <div>No data</div>
            )}
          </div>
        </section>
        <section className={`${styles.section} ${styles.card}`}>
          <h2>Users (last 14 days)</h2>
          <div className={styles.chartWrap}>
            {userCounts ? (
              <Line data={usersChart.data} options={usersChart.options} />
            ) : (
              <div>No data</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
