const getRandomColor = () => {
    const colors = [
      "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
      "#9966FF", "#FF9F40", "#E7E9ED", "#00A86B",
      "#FF6F61", "#6B5B95", "#88B04B", "#F7CAC9"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  export default getRandomColor;
