<script>
    import Navbar from "$lib/components/Navbar.svelte";

    const handleSubmit = {
        
    }
</script>

<Navbar logged_in={false}/>

<div class="center-screen">

    <h1 class="title">signup</h1>
    <small id="safety" class="text-muted" style="margin-bottom:50px">We'll never share your information with anyone else.</small>

    <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="name">name</label>
          <input type="name" class="form-control" id="name" aria-describedby="emailHelp" placeholder="Name">
        </div>
        <div class="form-group">
          <label for="password">password</label>
          <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
        </div>
        <div class="form-group">
            <label for="dob">date of birth</label>
            <input type="date" class="form-control" id="dob" placeholder="Date of Birth">
        </div>
        <div class="form-group">
            <label for="dob">role</label>
            <select class="form-control form-control">
                <option>Patient</option>
                <option>Doctor </option>
            </select>
        </div>

        <button type="submit" class="btn btn-success" style="margin: 40px; width: 100px">create <i class="bi bi-plus-circle-fill"></i></button>


    </form>

    
</div>