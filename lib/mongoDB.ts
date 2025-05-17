import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDB = async (): Promise<void> => {
	mongoose.set("strictQuery", true);

	if (isConnected) {
		return;
	}

	try {
		await mongoose.connect(process.env.MONGODB_URL || "", {
			dbName: "relife",
		});

		isConnected = true;
	} catch (err) {
		console.log(err);
	}
};
