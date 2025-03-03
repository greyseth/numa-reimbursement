import numaLogo from "../assets/img/dashboardImage.png";

import { useContext, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import formatPrice from "../util/priceFormatter";
import LoadingSpinner from "../components/LoadingSpinner";
import LoadingError from "../components/LoadingError";
import request from "../util/API";
import { LoginContext } from "../providers/LoginProvider";

export default function Page_Dashboard() {
  const { loginData, setLoginData } = useContext(LoginContext);

  const [dataLoading, setDataLoading] = useState({});
  const [transferData, setTransferData] = useState([]);
  const [pettyData, setPettyData] = useState([]);
  const [transferTotal, setTransferTotal] = useState(0);
  const [pettyTotal, setPrettyTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(0);

  const MONTH_COLORS = [
    "#1f456e",
    "#c85073",
    "#67b075",
    "#a9d08f",
    "#f0e68c",
    "#ffdb58",
    "#ff8c00",
    "#e9967a",
    "#90ee90",
    "#d2691e",
    "#8b4513",
    "#008080",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  async function fetchData() {
    setDataLoading({});

    const response = await request(
      "GET",
      `/requests/yearly${selectedMonth == 0 ? "" : `/${selectedMonth}`}`
    );
    if (response.error) return setDataLoading({ error: true });

    setTransferData(
      response.transfer.map((td, i) => ({
        ...td,
        amount: parseInt(td.amount),
        fill: MONTH_COLORS[i],
      }))
    );
    setPettyData(
      response.petty.map((td, i) => ({
        ...td,
        amount: parseInt(td.amount),
        fill: MONTH_COLORS[i],
      }))
    );
    setDataLoading(undefined);
  }

  useEffect(() => {
    if (
      loginData &&
      (loginData.role === "approver" || loginData.role === "admin")
    )
      fetchData();
  }, [loginData, selectedMonth]);

  useEffect(() => {
    let total = 0;
    transferData.forEach((data) => (total += parseInt(data.amount)));
    setTransferTotal(total);

    let total2 = 0;
    pettyData.forEach((data) => (total2 += parseInt(data.amount)));
    setPrettyTotal(total2);
  }, [transferData, pettyData]);

  return (
    <>
      <h1 className="mb-4">
        {loginData ? `Welcome, ${loginData.username}` : null}
      </h1>

      {loginData &&
      (loginData.role === "approver" || loginData.role === "admin") ? (
        dataLoading ? (
          dataLoading.error ? (
            <LoadingError onRetry={fetchData} />
          ) : (
            <LoadingSpinner />
          )
        ) : (
          <>
            <select
              className="p-1 bg-primary rounded text-white cursor-pointer mb-3"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value={0}>All Year</option>
              {months.map((m, i) => (
                <option value={i + 1} key={i}>
                  {m}
                </option>
              ))}
            </select>

            <h1 className="font-bold text-xl">
              {new Date().getFullYear()} Reimbursement Stats
            </h1>
            <p className="mb-3">Year Total: {formatPrice(transferTotal)}</p>
            {transferData.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <div className="max-h-[350px] overflow-y-scroll">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferData.map((td) => (
                        <tr>
                          <td>{td.category}</td>
                          <td>{formatPrice(td.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ResponsiveContainer width={"100%"} height={400}>
                  <PieChart>
                    <Pie
                      data={transferData}
                      nameKey={"category"}
                      dataKey={"amount"}
                      innerRadius={30}
                      label={renderCustomizedLabel}
                      labelLine={false}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <h1 className="w-full text-center">
                No requests in this category have been made yet
              </h1>
            )}

            <hr className="h-1 bg-contrast mb-12"></hr>

            <h1 className="font-bold text-xl">
              {new Date().getFullYear()} Petty Cash Reimbursement Stats
            </h1>
            <p className="mb-3">Year Total: {formatPrice(pettyTotal)}</p>
            {pettyData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="max-h-[350px] overflow-y-scroll">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pettyData.map((td) => (
                        <tr>
                          <td>{td.category}</td>
                          <td>{formatPrice(td.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ResponsiveContainer width={"100%"} height={400}>
                  <PieChart>
                    <Pie
                      data={pettyData}
                      nameKey={"category"}
                      dataKey={"amount"}
                      innerRadius={30}
                      label={renderCustomizedLabel}
                      labelLine={false}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <h1 className="w-full text-center">
                No requests in this category have been made yet
              </h1>
            )}
          </>
        )
      ) : (
        <img src={numaLogo} className="w-[80%] block mx-auto" />
      )}
    </>
  );
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};
