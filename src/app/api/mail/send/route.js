import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
    try {
        const { to, subject, html } = await req.json();

        // Transporter for Gmail SMTP
        const transporter = nodemailer.createTransport({
        service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to,
            subject,
            html,
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Email error:", err);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}