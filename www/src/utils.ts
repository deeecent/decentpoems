import { ethers, type BigNumberish } from "ethers";

export function timeLeft(secondsLeft: number) {
  let delta = Math.max(0, secondsLeft);
  const days = Math.floor(delta / 86400);
  delta -= days * 86400;
  const hours = Math.floor(delta / 3600);
  delta -= hours * 3600;
  const minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;
  const seconds = Math.floor(delta);
  const all = [days, hours, minutes, seconds].map((x) =>
    x.toString().padStart(2, "0")
  );
  return `${all[0]}d ${all[1]}h ${all[2]}m ${all[3]}s`;
}

export function formatEther(value: BigNumberish, decimals = 4) {
  const res = parseFloat(ethers.utils.formatEther(value));
  return Math.round(res * 1e4) / 1e4;
}

export function shortAddress(address: string) {
  return address.slice(0, 6) + "…" + address.slice(-4);
}
