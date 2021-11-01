import Xarrow from "react-xarrows";

export default function Edge({ edge }) {
  return (
    <Xarrow
      {...edge}
      showHead={false}
      curveness={0}
      endAnchor="middle"
      startAnchor="middle"
      passProps={{ onClick: () => {} }}
      zIndex={-1}
    />
  );
}
