import express from "express";
import {Verify,User,RequestDoxxer} from "./schema/schema";
import  "./db";
import cors from 'cors'
import multer from 'multer'

const PORT: number = 7000
const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/postVerify/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { contract_address } = req.body
      const contractExist = await Verify.findOne({ contract_address })
      if(contractExist?.status === 'pending') {
        res.status(200).json({ message: 'you have a pending project with the same contract address' })
      } else {
        const verifyData = new Verify({ ...req.body, user: id });
        const validationErrors = verifyData.validateSync();
        if (validationErrors) {
          res.status(400).json({ message: 'Validation failed', errors: validationErrors });
        } else {
          const savedVerifyData = await verifyData.save();
          res.status(200).json({ message: 'Success', data: savedVerifyData });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error });
    }
})
  
app.get('/api/verifyRequests/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const yourRequests = await Verify.find({ user: id });
  
      const pendingRequests = yourRequests.filter((request) => request.status === "pending");
  
      const approvedRequests = yourRequests.filter((request) => request.status === "approved");
  
      if (pendingRequests.length === 0 && approvedRequests.length === 0) {
        res.status(200).json({
          message: "You don't have any pending or approved verify requests",
          response: "You don't have any pending or approved verify requests"
        });
      } else {
        const result = {
          pending: pendingRequests,
          approved: approvedRequests
        };
  
        console.log(result);
        res.status(200).json({ message: "Success", result });
      }
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Failed", result: error });
    }
});
  
app.get('/api/getVerify', async(req,res) => {
  try {
    const all = await Verify.find({})
    const notApproved = all.filter((response) => response.status === 'pending')
    res.status(200).json({message: "success", result: notApproved })
    console.log(notApproved)
  } catch(error) {
    console.error(error)
    res.status(400).json({message: "failed:", result: error})
  }
})

// this returns the data of tghe pending accoun from the contract address
app.get('/api/getVerifyData/:contract_address', async (req, res) => {
  try {
    const {contract_address} = req.params;
    const data = await Verify.findOne({contract_address});
    if(data) {
      res.status(200).json({message: "success", result: data})
      console.log(data)
    } 
    res.send(404).json({message: "failed", result: "data not found"})
    console.log("data not found")
  } catch(error) {
    res.send(500).json({message: "internal server error", result: error})
    console.error(error)
  }
})

app.post('/api/approveProject/:contract_address', async (req, res) => {
  try {
    const { contract_address } = req.params;
    const project = await Verify.findOne({ contract_address });
    if (!project) {
      return res.status(404).json({ message: "failed", result: "project not found" });
    }
    const { status } = req.body
    if (status === "approved" || status === "rejected") {
      project.status = status
      await project.save()
      console.log(project)
      return res.status(200).json({ message: "success", result: project })
    } else {
      return res.status(400).json({ message: "failed", result: "invalid status" })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "internal server error", result: error })
  }
});

app.get('/api/approvedProjects/:searchText', async (req, res) => {
  const {searchText} = req.query; // Use req.query to access query parameters
  try {
    const approved = await Verify.find({ status: "approved" });

    if (approved.length === 0) {
      res.status(404).json({ message: "No approved projects found" });
    } else {
      // Filter the projects in the backend
      const filteredProjects = approved.filter((proj) => {
        const contractAddress = proj.contract_address.toLowerCase();
        const projectName = proj.name_of_project.toLowerCase();
        return contractAddress.includes(searchText) || projectName.includes(searchText);
      });

      if (filteredProjects.length === 0) {
        res.status(404).json({ message: "No matching projects found" });
      } else {
        console.log(filteredProjects)
        res.status(200).json({ message: "Success", result: filteredProjects });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", result: error });
  }
});

app.get('/api/login/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const account = await User.findOne({ user_id: id }); // Use 'user_id' to find the account
    if (account) {
      res.status(200).json({ message: "success", result: account });
      console.log(account)
    } else {
      res.status(200).json({ message: "failed", result: null }); // Return a result indicating failure
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", result: error });
  }
});

app.get('/api/profile/:id', async(req,res) => {
  try {
      const {id} = req.params
      const profile = await User.findOne({_id: id})
      if(!profile) {
          res.status(200).json({message: "failed", result: "account not found"})
          console.log("account not found")
      }
      res.status(200).json({message: "success", result: profile})
      console.log(profile)
  } catch(error) {
      res.status(500).json({message: "internal server error", result: error})
      console.error(error)
  }
})

app.post('/api/createAccount', async (req, res) => {
  try {
    const {firebaseAccountId, accountData} = req.body
    const {first_name, last_name, email_address} = accountData
    const createNewAccount = new User({user_id:firebaseAccountId, last_name, first_name, email_address});
    const newSavedUser = await createNewAccount.save();
    console.log(newSavedUser);
    res.status(200).json({ message: "success", result: newSavedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error:", result: error });
  }
});

app.post('/api/requestSuperUserRole', async(req,res) => {
  try {
    const {reqDoxMessage} = req.body;
    console.log(reqDoxMessage)
    const existingRequest = await RequestDoxxer.findOne({user: reqDoxMessage.id})

    if(existingRequest?.status == "pending") {
      res.status(409).json({message: "Resource already exists"})
    }
    const newRequest = new RequestDoxxer({github: reqDoxMessage.gitHubLink, reason: reqDoxMessage.reasonValue, cv: reqDoxMessage.cv, user: reqDoxMessage.id})
    const savedRequest = await newRequest.save()
    res.status(200).json({ message: "success", result: savedRequest });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "internal server error:", result: error });
  }
})

app.get('/api/getSuperUsersRequest', async(req,res) => {
  try {
    console.log('working')
    const requestApplication = await RequestDoxxer.find({}).populate('user', 'first_name email_address');
    console.log(requestApplication)
    if(requestApplication.length === 0) {
      res.status(404).json({ message: "Resource not found" })
      return;
    }

    res.status(200).json({ message: "success", result: requestApplication})
  } catch (error) {
    console.error(error)
    res.status(500).json({messsage: "internal server error:", result: error });
  }
})

app.listen(PORT,()=> {
    console.log('app listining on port: ',PORT)
})