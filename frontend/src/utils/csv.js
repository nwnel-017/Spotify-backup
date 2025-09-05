// /src/utils/csv.js

export const convertTracksToCSV = (tracks) => {
  const headers = ["#", "Track Name", "Artists", "Album", "Spotify URL"];
  const rows = tracks.map((item, index) => {
    const track = item.track;
    const artists = track.artists.map((a) => a.name).join(", ");
    return [
      index + 1,
      track.name,
      artists,
      track.album.name,
      track.external_urls.spotify,
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csv;
};

export const downloadCSV = (csvData, filename = "playlist.csv") => {
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
