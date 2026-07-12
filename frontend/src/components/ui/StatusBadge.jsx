const variants = {
  green: 'badge-green',
  yellow: 'badge-yellow',
  red: 'badge-red',
  blue: 'badge-blue',
};

export default function StatusBadge({ label, variant = 'green' }) {
  return <span className={variants[variant] || variants.green}>{label}</span>;
}
