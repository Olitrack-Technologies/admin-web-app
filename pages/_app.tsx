import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/tiptap/styles.css";
import "@/styles/globals.css";

import { ToastContainer } from "react-toastify";

import { createTheme, MantineProvider } from "@mantine/core";
import { AppProps } from "next/app";

// Brand theme — deep navy primary matching the sidebar
const theme = createTheme({
	fontFamily: "EudoxusSans",
	primaryColor: "olitrack",
	colors: {
		olitrack: [
			"#eff2fb",
			"#dce0ef",
			"#b4bee2",
			"#8a9ad5",
			"#677cca",
			"#5268c4",
			"#172554",
			"#384fab",
			"#30469a",
			"#253c88"
		]
	}
});

export default function App({ Component, pageProps }: AppProps) {
	return (
		<MantineProvider theme={theme}>
			<ToastContainer />
			<Component {...pageProps} />
		</MantineProvider>
	);
}
