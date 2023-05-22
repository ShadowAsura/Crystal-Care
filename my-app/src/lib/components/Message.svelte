<script>
  export let author;
  export let text;
  export let timestamp;

  let date = new Date(timestamp);
</script>

<div>
  <span>From: {author}</span>
  <p>{text}</p>
  <span>Sent at: {date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
</div>
