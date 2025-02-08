let contract;
let signer;

// Replace with your actual contract address and ABI
const contractAddress = "0xFb8F8E63fef9B20E4dCD7fed1e3D5D6a89A9E154";
const abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "approveWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Donation",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "requester",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FundsWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "RequestApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "requester",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RequestCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_reason",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "requestWithdrawal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "requestCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "requests",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "requester",
        type: "address",
      },
      {
        internalType: "string",
        name: "reason",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "completed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Connect to MetaMask and Blockchain
async function connectToBlockchain() {
  if (typeof window.ethereum !== "undefined") {
    try {
      console.log("MetaMask detected. Requesting accounts...");
      await ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      const account = await signer.getAddress();
      console.log("Connected account:", account);

      contract = new ethers.Contract(contractAddress, abi, signer);
      console.log("Contract initialized:", contract);

      alert("Connected to MetaMask and blockchain successfully!");
      await getBalance(); // Fetch balance after connection
    } catch (error) {
      console.error("Error during MetaMask connection:", error);
      alert("Error connecting to MetaMask. Check console for details.");
    }
  } else {
    console.error("MetaMask not detected.");
    alert("MetaMask is not installed. Please install MetaMask and try again.");
  }
}

// Validate input amounts
function isValidAmount(amount) {
  return !isNaN(amount) && Number(amount) > 0;
}

// Donate function
async function donate() {
  const donationAmount = document.getElementById("donationAmount").value;

  if (!contract) {
    alert("Please connect to MetaMask first.");
    return;
  }

  if (!isValidAmount(donationAmount)) {
    alert("Please enter a valid donation amount greater than 0.");
    return;
  }

  try {
    const tx = await contract.donate({
      value: ethers.utils.parseEther(donationAmount),
    });

    document.getElementById("donationStatus").innerText =
      "Transaction sent. Waiting for confirmation...";
    console.log("Transaction hash:", tx.hash);

    await tx.wait();
    document.getElementById("donationStatus").innerText =
      "🎉 Donation successful!";

    await getBalance(); // Update balance after donation
  } catch (error) {
    console.error("Error during donation:", error);
    alert("Donation failed. Check the console for details.");
  }
}

// Request Withdrawal function
async function requestWithdrawal() {
  const withdrawAmount = document.getElementById("withdrawAmount").value;

  if (!contract) {
    alert("Please connect to MetaMask first.");
    return;
  }

  if (!isValidAmount(withdrawAmount)) {
    alert("Enter a valid withdrawal amount greater than 0.");
    return;
  }

  try {
    const reason = document.getElementById("withdrawReason").value; // Capture the reason for the withdrawal
    const amountInWei = ethers.utils.parseEther(withdrawAmount);

    const tx = await contract.requestWithdrawal(reason, amountInWei);
    document.getElementById("withdrawalStatus").innerText =
      "Requesting withdrawal...";

    console.log("Transaction hash:", tx.hash);
    await tx.wait();

    document.getElementById("withdrawalStatus").innerText =
      "✅ Withdrawal request successful!";

    await getBalance(); // Update balance after withdrawal request
  } catch (error) {
    console.error("Error during withdrawal request:", error);
    alert("Withdrawal request failed. Check console for details.");
  }
}

// Approve Withdrawal Request (Admin only)
async function approveWithdrawalRequest() {
  const requestId = document.getElementById("requestId").value;

  if (!contract) {
    alert("Please connect to MetaMask first.");
    return;
  }

  try {
    const tx = await contract.approveWithdrawal(requestId);
    document.getElementById("approvalStatus").innerText =
      "Approving request...";

    console.log("Transaction hash:", tx.hash);
    await tx.wait();

    document.getElementById("approvalStatus").innerText =
      "✅ Request approved!";

    await getBalance(); // Update balance after approval
  } catch (error) {
    console.error("Error during request approval:", error);
    alert("Request approval failed. Check console for details.");
  }
}

// Withdraw function (only after request approval)
// Update the withdraw function to handle execution status
async function withdraw() {
  const requestId = document.getElementById("withdrawRequestId").value;

  if (!contract) {
    alert("Please connect to MetaMask first.");
    return;
  }

  try {
    const tx = await contract.withdraw(requestId);
    document.getElementById("executeWithdrawStatus").innerText =
      "Processing withdrawal...";

    await tx.wait();
    document.getElementById("executeWithdrawStatus").innerText =
      "✅ Withdrawal executed!";

    await getBalance(); // Update balance after successful withdrawal
  } catch (error) {
    console.error("Error during withdrawal execution:", error);
    alert("Withdrawal execution failed. Check console for details.");
  }
}

// Ensure approveWithdrawalRequest is properly connected
async function approveWithdrawalRequest() {
  const requestId = document.getElementById("requestId").value;

  if (!contract) {
    alert("Please connect to MetaMask first.");
    return;
  }

  try {
    const tx = await contract.approveWithdrawal(requestId);
    document.getElementById("approvalStatus").innerText =
      "Approving request...";

    await tx.wait();
    document.getElementById("approvalStatus").innerText =
      "✅ Request approved!";
  } catch (error) {
    console.error("Error during approval:", error);
    alert("Approval failed. Are you the admin? Check console.");
  }
}

// Check Request Details (whether approved or completed)
async function checkRequest(id) {
  try {
    const request = await contract.requests(id);
    console.log("Request Details:", request);

    if (!request.approved) {
      alert("This withdrawal request is not approved yet.");
      return false;
    }
    if (request.completed) {
      alert("This withdrawal has already been completed.");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error fetching request details:", error);
    return false;
  }
}

// Get Contract Balance
// Get Contract Balance
async function getBalance() {
  if (!contract) {
    alert("Please connect to MetaMask first.");
    return;
  }

  try {
    // Fetch the balance of the contract
    const balance = await contract.getBalance();
    document.getElementById(
      "contractBalance"
    ).innerText = `Contract Balance: ${ethers.utils.formatEther(balance)} ETH`;

    console.log("Updated Balance:", ethers.utils.formatEther(balance));
  } catch (error) {
    console.error("Error fetching balance:", error);
    alert("Failed to fetch balance. Check console for details.");
  }
}

// Ensure connection to MetaMask on button click
document
  .getElementById("connectButton")
  .addEventListener("click", connectToBlockchain);
