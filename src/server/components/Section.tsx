import type React from "react";

export function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="p-4 space-y-2">
			<h2 className="text-xl font-semibold">{title}</h2>
			{children}
		</section>
	);
}
