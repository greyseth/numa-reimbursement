import { useEffect, useState } from "react";
import request from "../util/API";

export default function CategoryDropdown({ className, onChange }) {
  const [loadingData, setLoadingData] = useState({});
  const [cats, setCats] = useState([]);
  const [selected, setSelected] = useState(undefined);

  async function fetchCategories() {
    setLoadingData({});

    const response = await request("GET", "/categories");
    if (response.error) return setLoadingData({ error: true });

    setCats(response);
    setSelected(response[0]);
    onChange(response[0]);
    setLoadingData(undefined);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  return (
    <select
      className={className}
      onChange={(e) =>
        setSelected(
          cats[cats.findIndex((c) => c.id_category == e.target.value)]
        )
      }
    >
      {loadingData ? (
        loadingData.error ? (
          <option value={-1}>Failed to fetch categories</option>
        ) : (
          <option value={-1}>Loading categories...</option>
        )
      ) : (
        cats.map((c) => (
          <option key={c.id_category} value={c.id_category}>
            {c.category}
          </option>
        ))
      )}
    </select>
  );
}
