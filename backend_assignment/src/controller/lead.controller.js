import { Enquiry } from "../model/enquiry.model.js";



export const createEnquiryEntry = async(req, res) => {
    try{
        const { name, email, phone, courseInterested, message="" } = req.body;

        if(!name || !email || !phone || !courseInterested){
            return res.status(400).json({success: false, message: "All fields are required"});
        }

        // check existing user
        const existingEnquiry = await Enquiry.findOne({phone: phone});
        if(existingEnquiry){
            return res.status(400).json({success: false, message: "User already exists"});
        }

        // create user
        const enquiry = await Enquiry.create({
            name,
            email,
            phone,
            courseInterested,
            message
        });

        return res.status(200).json({
            success: true,
            message: "Enquiry created successfully",
        })
    }
    catch(err){
        return res.status(500).json({success: false, message: "Internal Server Error", errror: err.message});
    }
}


export const getPublicEnquiries = async(req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const enquiries = await Enquiry.find({isClaimed: false})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            enquiries,
            pagination: {
                total: enquiries.length,
                currentPage: page,
                totalPages: Math.ceil(enquiries.length / limit)
            }
        });
    }
    catch(err){
        return res.status(500).json({success: false, message: "Internal Server Error", errror: err.message});
    }
}





export const claimLead = async(req, res)=>{
    try{
        const userId = req.user.id;

        const lead = await Enquiry.findById(req.params.id);
        if(!lead){
            return res.status(404).json({success: false, message: "Lead not found"});
        }
        
        // check is lead already claimed
        if(lead.isClaimed){
            return res.status(400).json({success: false, message: "Lead already claimed"});
        }

        // if not claimed then assign to logged user
        lead.claimedBy = userId;
        lead.isClaimed = true;
        lead.claimedAt = Date.now();

        await lead.save();

        return res.status(200).json({
            success: true,
            message: "Lead claimed successfully"
        })

    }
    catch(err){
        return res.status(500).json({success: false, message: "Internal Server Error", errror: err.message});
    }
}



export const myClaimedleads = async(req, res)=>{
    try{
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const leads = await Enquiry
            .find({isClaimed: true, claimedBy: userId})
            .sort({claimedAt: -1})
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            leads,
            pagination: {
                total: leads.length,
                currentPage: page,
                totalPages: Math.ceil(leads.length / limit)
            }
        })
    }
    catch(err){
        return res.status(500).json({success: false, message: "Internal Server Error", errror: err.message});
    }
}