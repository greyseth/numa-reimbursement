import { Pie, PieChart } from "recharts";

export default function Page_Testing() {
  const data = {
    transfer: [
      {
        category: "Perizinan dan Legalitas",
        amount: 5050000,
      },
      {
        category: "Penginapan",
        amount: 65000,
      },
    ],
    petty: [
      {
        category: "Perizinan dan Legalitas",
        amount: 185801,
      },
      {
        category: "Penginapan",
        amount: 75000,
      },
    ],
  };

  return (
    <>
      <PieChart width={730} height={250}>
        <Pie
          data={data.transfer}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={50}
          fill="#8884d8"
        />
        <Pie
          data={data.petty}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#82ca9d"
          label
        />
      </PieChart>
    </>
  );
}
