class ProgressTracker {
    constructor() {
      this.progressBar = document.getElementById("progressBar");
      this.progressLabel = document.getElementById("progressLabel");
      this.closeButton = document.getElementById("closeButton");
    }
  
    initialize(totalAlgorithms) {
      this.progressBar.setAttribute("aria-valuemin", "0");
      this.progressBar.setAttribute("aria-valuemax", totalAlgorithms.toString());
      this.progressBar.setAttribute("aria-valuenow", "0");
      this.progressBar.style.width = "0%";
      this.closeButton.style.display = "none";
    }
  
    updateLabel(text) {
      this.progressLabel.textContent = text;
    }
  
    updateProgress(currentIndex) {
      const progressPercentage = (currentIndex / parseInt(this.progressBar.getAttribute("aria-valuemax"), 10)) * 100;
      this.progressBar.setAttribute("aria-valuenow", currentIndex.toString());
      this.progressBar.style.width = `${progressPercentage}%`;
    }
  
    completeProgress() {
      this.progressLabel.textContent = "All tests completed!";
      this.progressBar.setAttribute("aria-valuenow", this.progressBar.getAttribute("aria-valuemax"));
      this.progressBar.style.width = "100%";
      this.closeButton.style.display = "block";
    }
  }
  
  export default ProgressTracker;
  