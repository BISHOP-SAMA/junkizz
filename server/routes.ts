import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.applications.create.path, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      const application = await storage.createApplication(input);

      // TODO: Send email using Resend API once the user provides their API Key
      if (process.env.RESEND_API_KEY) {
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Junkyard <onboarding@resend.dev>',
              to: 'delivered@resend.dev', // Default test email for Resend
              subject: 'New Junkie Application',
              html: `<p>New application received from <strong>${application.xUsername}</strong> (EVM: ${application.evmAddress})</p>`
            })
          });
          if (!resendRes.ok) {
            console.error('Failed to send email:', await resendRes.text());
          }
        } catch (e) {
          console.error('Error sending email:', e);
        }
      } else {
        console.log("No RESEND_API_KEY set, skipping email notification.", application);
      }

      res.status(201).json(application);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.applications.status.path, async (req, res) => {
    try {
      const address = req.params.address;
      const application = await storage.getApplicationByAddress(address);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.status(200).json({ status: "certified" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
