<section>
  <span class="loader" />
</section>

<style>
  section {
    text-align: center;
  }

  @media (prefers-color-scheme: light) {
    .loader {
      border-top: 3px solid rgb(100, 84, 130);
    }
  }
  
  @media (prefers-color-scheme: dark) {
    .loader {
      border-top: 3px solid #252a50;
    }
  }

  .loader {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    display: inline-block;
    border-right: 3px solid transparent;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
