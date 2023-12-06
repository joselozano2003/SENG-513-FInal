import React from "react";
import Image from "next/image";
import type { Metadata } from "next";
import styles from "./styles.module.css";

// assets
import funkyBlueBackground from "public/prompt-game-background.jpg";

export const metadata: Metadata = {
    title: "Prompt Game",
    // description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                maxWidth: "100%",
            }}
        >
            <div>
                <Image
                    src={funkyBlueBackground}
                    alt="funky blue background"
                    placeholder="blur"
                    quality={100}
                    fill
                    sizes="100vw"
                    // style={{ objectFit: "cover" }}
                />
            </div>
            <div style={{ position: "absolute", zIndex: 1, width: "100%", height: "100%", padding: "4vh 3vw" }}>{children}</div>
        </div>
    );
}
