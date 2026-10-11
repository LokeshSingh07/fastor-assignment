import { Router } from "express";
const leadRouter = Router();


import { authMiddleware } from "../middleware/auth.middleware.js";
import { createEnquiryEntry, claimLead, getPublicEnquiries, myClaimedleads } from "../controller/lead.controller.js";



leadRouter.post("/enquiry", createEnquiryEntry);
leadRouter.get("/all-enquiries", authMiddleware, getPublicEnquiries);
leadRouter.post("/claim-lead/:id", authMiddleware, claimLead);
leadRouter.get("/my-claimed-leads", authMiddleware, myClaimedleads);






export default leadRouter;