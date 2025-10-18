import Link from "next/link";

export default function AdminHome(){
  return (
    <div className="container grid">
      <h1>Admin</h1>
      <div className="row">
        <Link href="/admin/templates"><button>Templates</button></Link>
        <Link href="/admin/banners"><button>Banners</button></Link>
        <Link href="/admin/slides"><button>Slides</button></Link>
      </div>
    </div>
  );
}
