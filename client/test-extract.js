const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractImages() {
  const loadingTask = pdfjsLib.getDocument(`${process.env.REACT_APP_API_URL}/uploads/1788356250958767800_test.pdf`);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const ops = await page.getOperatorList();
  
  let currentTransform = [1, 0, 0, 1, 0, 0];
  const transformStack = [];
  const images = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i];

    if (fn === pdfjsLib.OPS.save) {
      transformStack.push([...currentTransform]);
    } else if (fn === pdfjsLib.OPS.restore) {
      currentTransform = transformStack.pop();
    } else if (fn === pdfjsLib.OPS.transform) {
      const [a, b, c, d, e, f] = args;
      const [a0, b0, c0, d0, e0, f0] = currentTransform;
      currentTransform = [
        a0 * a + c0 * b,
        b0 * a + d0 * b,
        a0 * c + c0 * d,
        b0 * c + d0 * d,
        a0 * e + c0 * f + e0,
        b0 * e + d0 * f + f0
      ];
    } else if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintJpegXObject) {
      console.log('Found image with ID:', args[0], 'at Y:', currentTransform[5]);
      images.push({ id: args[0], y: currentTransform[5] });
    }
  }
  
  for (const img of images) {
    try {
      const obj = await page.objs.get(img.id);
      console.log('Extracted image:', img.id, 'width:', obj.width, 'height:', obj.height, 'kind:', obj.kind);
    } catch (err) {
      console.log('Error getting image:', err.message);
    }
  }
}
extractImages().catch(console.error);
