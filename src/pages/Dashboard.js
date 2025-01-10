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

  const [activeIndex, setActiveIndex] = useState(-1);
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

  async function fetchData() {
    setDataLoading({});

    const response = await request("GET", "/requests/yearly");
    if (response.error) setDataLoading({ error: true });

    setTransferData(
      response.transfer.map((td, i) => ({ ...td, fill: MONTH_COLORS[i] }))
    );
    setPettyData(
      response.petty.map((td, i) => ({ ...td, fill: MONTH_COLORS[i] }))
    );
    setDataLoading(undefined);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let total = 0;
    transferData.forEach((data) => (total += data.amount));
    setTransferTotal(total);

    let total2 = 0;
    pettyData.forEach((data) => (total2 += data.amount));
    setPrettyTotal(total2);
  }, [transferData, pettyData]);

  return (
    <>
      <h1 className="mb-4">
        {loginData ? `Welcome, ${loginData.username}` : null}
      </h1>

      {dataLoading ? (
        dataLoading.error ? (
          <LoadingError onRetry={fetchData} />
        ) : (
          <LoadingSpinner />
        )
      ) : (
        <>
          <h1 className="font-bold text-xl">
            {new Date().getFullYear()} Reimbursement Stats
          </h1>
          <p>Year Total: {formatPrice(transferTotal)}</p>
          <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3">
            <div>
              <ResponsiveContainer width={"100%"} height={300}>
                <BarChart data={transferData}>
                  <XAxis dataKey={"month"} fontSize={8} />
                  <YAxis
                    fontSize={8}
                    tickFormatter={(entry) => formatPrice(entry)}
                  />
                  <Bar dataKey={"amount"} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <ResponsiveContainer width={"100%"} height={400}>
                <PieChart>
                  <Pie
                    data={transferData}
                    dataKey={"amount"}
                    innerRadius={30}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <hr className="h-1 bg-contrast mb-12"></hr>

          <h1 className="font-bold text-xl">
            {new Date().getFullYear()} Petty Cash Reimbursement Stats
          </h1>
          <p>Year Total: {formatPrice(pettyTotal)}</p>
          <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-3">
            <div>
              <ResponsiveContainer width={"100%"} height={300}>
                <BarChart data={pettyData}>
                  <XAxis dataKey={"month"} fontSize={8} />
                  <YAxis
                    fontSize={8}
                    tickFormatter={(entry) => formatPrice(entry)}
                  />
                  <Bar dataKey={"amount"} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <ResponsiveContainer width={"100%"} height={400}>
                <PieChart>
                  <Pie
                    data={transferData}
                    dataKey={"amount"}
                    innerRadius={30}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
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
