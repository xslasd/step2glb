import occtimportjs from 'occt-import-js';
import { parentPort } from 'worker_threads';

parentPort.on("message", async (data) => {
	let occt = await occtimportjs();
	let result = null;
	if (data.format === 'step') {
		result = occt.ReadStepFile(data.buffer, null);
	} else if (data.format === 'iges') {
		result = occt.ReadIgesFile(data.buffer, null);
	} else if (data.format === 'brep') {
		result = occt.ReadBrepFile(data.buffer, null);
	}
	parentPort.postMessage(result);
})
