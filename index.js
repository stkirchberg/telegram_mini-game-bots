const lastGame = JSON.parse(localStorage.getItem("lastGame"));

if (lastGame) {
    const section = document.getElementById("continueSection");
    const link = document.getElementById("continueLink");
    const title = document.getElementById("continueTitle");

    title.textContent = lastGame.name;
    link.href = lastGame.href;
    section.classList.remove("hidden");
}

document.querySelectorAll(".game-card").forEach(card => {
    card.addEventListener("click", () => {
        localStorage.setItem("lastGame", JSON.stringify({
            name: card.dataset.game,
            href: card.getAttribute("href")
        }));
    });
});
