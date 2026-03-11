export default function CountryFlag({
  flag,
  country,
}: {
  flag: string | null;
  country: string;
}) {
  if (!flag) {
    return <span className="text-sm">{country}</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flag}
      alt={country}
      className="inline-block rounded-sm w-5 h-auto"
    />
  );
}
