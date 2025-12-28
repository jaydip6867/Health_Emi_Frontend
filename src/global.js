  export let showReportOrPrication = (path) => {
    const remark = path || "";
    const base = remark.toLowerCase().split("?")[0];
    const isImage =
      base.endsWith(".jpg") || base.endsWith(".jpeg") || base.endsWith(".png");
    const link = isImage
      ? remark
      : `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
          remark
        )}`;
    return link;
  };