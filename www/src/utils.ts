import { ethers, type BigNumberish } from "ethers";

// Thanks https://stackoverflow.com/a/71748235/597097
export function secondsToHms(seconds: number) {
  if (seconds <= 0) {
    return "00:00:00";
  } else {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.floor((seconds % 3600) % 60);

    let hDisplay = h <= 9 ? "0" + h + ":" : h + ":";
    let mDisplay = m <= 9 ? "0" + m + ":" : m + ":";
    let sDisplay = s <= 9 ? "0" + s : s;

    return hDisplay + mDisplay + sDisplay;
  }
}

export function formatEther(value: BigNumberish, decimals = 4) {
  const res = parseFloat(ethers.utils.formatEther(value));
  return Math.round(res * 1e4) / 1e4;
}
