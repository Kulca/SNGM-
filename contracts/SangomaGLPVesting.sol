// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SangomaGLPVesting is Ownable, ReentrancyGuard {
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 amountWithdrawn;
        uint256 startTime;
        uint256 duration;
    }

    IERC20 public immutable sngmToken;
    mapping(address => VestingSchedule[]) public userSchedules;

    event TokensLocked(address indexed user, uint256 amount, uint256 startTime, uint256 duration);
    event TokensClaimed(address indexed user, uint256 amount);

    constructor(address _sngmToken) Ownable(msg.sender) {
        sngmToken = IERC20(_sngmToken);
    }

    function lock(address user, uint256 amount, uint256 duration) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        require(sngmToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        userSchedules[user].push(VestingSchedule({
            totalAmount: amount,
            amountWithdrawn: 0,
            startTime: block.timestamp,
            duration: duration
        }));

        emit TokensLocked(user, amount, block.timestamp, duration);
    }

    function claimable(address user, uint256 scheduleIndex) public view returns (uint256) {
        VestingSchedule storage schedule = userSchedules[user][scheduleIndex];
        if (block.timestamp <= schedule.startTime) return 0;
        
        uint256 elapsedTime = block.timestamp - schedule.startTime;
        if (elapsedTime >= schedule.duration) {
            return schedule.totalAmount - schedule.amountWithdrawn;
        } else {
            // Monthly release logic (approximate 30 days)
            uint256 monthsPassed = elapsedTime / 30 days;
            uint256 totalMonths = schedule.duration / 30 days;
            if (totalMonths == 0) totalMonths = 1;
            
            uint256 releasedAmount = (schedule.totalAmount * monthsPassed) / totalMonths;
            if (releasedAmount > schedule.amountWithdrawn) {
                return releasedAmount - schedule.amountWithdrawn;
            }
            return 0;
        }
    }

    function claimAll() external nonReentrant {
        uint256 totalToClaim = 0;
        for (uint256 i = 0; i < userSchedules[msg.sender].length; i++) {
            uint256 amount = claimable(msg.sender, i);
            if (amount > 0) {
                userSchedules[msg.sender][i].amountWithdrawn += amount;
                totalToClaim += amount;
            }
        }
        require(totalToClaim > 0, "Nothing to claim");
        require(sngmToken.transfer(msg.sender, totalToClaim), "Transfer failed");
        emit TokensClaimed(msg.sender, totalToClaim);
    }
}
