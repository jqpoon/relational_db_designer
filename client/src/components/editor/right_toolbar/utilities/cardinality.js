import { cardinality } from "../../types";

export default function CardinalityChoices({ value, onChange }) {
  return (
    <>
      <select name="Cardinality" onChange={onChange}>
        <option value="" selected={value === ""} disabled hidden>
          Cardinality
        </option>
        {Object.entries(cardinality).map(([k, v]) => {
          return (
            <option value={k} selected={k === value}>
              {v}
            </option>
          );
        })}
      </select>
    </>
  );
}
