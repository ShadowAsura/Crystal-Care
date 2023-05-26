<script>
    import Navbar from "$lib/components/Navbar.svelte";
</script>

<Navbar logged_in={false}/>

<div class="center-screen">

    <h1 class="title" style="margin-bottom: 50px">login</h1>

    <form>
        <div class="form-group">
          <label for="email">email address</label>
          <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email">
        </div>
        <div class="form-group">
          <label for="exampleInputPassword1">password</label>
          <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
        </div>
        <button type="submit" class="btn btn-success">submit <i class="bi bi-check"></i></button>
    </form>
</div>