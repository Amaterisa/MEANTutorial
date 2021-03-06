import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  enteredContent = '';
  enteredTitle = '';
  form: FormGroup;
  imagePreview: string;
  isLoading = false;
  private mode = 'create';
  private postId!: string;
  post: Post;

  constructor(public postsService: PostService, public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      content: new FormControl(null, {validators: [Validators.required]}),
      image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')){
        this.mode = 'edit';
        this.postId = paramMap.get('postId') || '';
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath};
          this.form.setValue({title: this.post.title, content: this.post.content, image: this.post.imagePath});
        });
      } else{
        this.mode = 'create';
        this.postId = '';
      }
    });
  }

  onSavePost(){
    if (this.form.invalid){
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create'){
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    }else{
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }
    this.form.reset();
  }

  onImagePicked(event: Event){
    const files = (event.target as HTMLInputElement).files;
    if (files !== null){
      const file = files[0];
      this.form.patchValue({image: file});
      const image = this.form.get('image');
      if (image !== null){
        image.updateValueAndValidity();
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  getErrorMessage(){
    return 'Please enter a post';
  }

}
