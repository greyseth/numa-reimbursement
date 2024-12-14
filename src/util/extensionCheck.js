export default function hasExtension(filename, exts) {
  return new RegExp("(" + exts.join("|").replace(/\./g, "\\.") + ")$").test(
    filename
  );
}
